import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";
import { organizationVerificationSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ organizationId: string }> }
) {
  const session = await requireSuperAdmin();
  const { organizationId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = organizationVerificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите status: VERIFIED или REJECTED." }, { status: 400 });
  }

  const company = await db.company.findUnique({
    where: { id: organizationId },
    include: { owner: true }
  });

  if (!company) {
    return NextResponse.json({ error: "Организация не найдена." }, { status: 404 });
  }

  if (company.verificationStatus !== "PENDING_VERIFICATION") {
    return NextResponse.json({ error: "Заявка уже обработана." }, { status: 409 });
  }

  await db.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: company.id },
      data: { verificationStatus: parsed.data.status }
    });

    if (parsed.data.status === "VERIFIED" && company.ownerId) {
      await tx.organizationMember.updateMany({
        where: { userId: company.ownerId, companyId: company.id },
        data: { status: "ACTIVE" }
      });
    }
  });

  await writeAuditLog({
    userId: session.user.id,
    companyId: company.id,
    action: parsed.data.status === "VERIFIED" ? "organization.verify" : "organization.reject",
    description: `Организация «${company.name}»: ${parsed.data.status}`
  });

  return NextResponse.json({ ok: true, status: parsed.data.status });
}
