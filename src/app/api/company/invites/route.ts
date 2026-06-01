import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/session";
import { inviteCreateSchema } from "@/lib/validators";
import { formatInviteCode, generateInviteCode } from "@/lib/invites";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await requireCompanyAdmin();
  const admin = await db.user.findUnique({
    where: { email: session.user.email! },
    select: { companyId: true }
  });

  if (!admin?.companyId) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }

  const invitations = await db.invitation.findMany({
    where: { companyId: admin.companyId },
    orderBy: { createdAt: "desc" },
    include: { department: true }
  });

  return NextResponse.json({ invitations });
}

export async function POST(request: Request) {
  const session = await requireCompanyAdmin();
  const admin = await db.user.findUnique({
    where: { email: session.user.email! },
    include: { company: true }
  });

  if (!admin?.companyId || !admin.company) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }

  if (admin.company.verificationStatus !== "VERIFIED") {
    return NextResponse.json(
      { error: "Приглашения доступны после верификации организации." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = inviteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте параметры приглашения." }, { status: 400 });
  }

  let code = generateInviteCode();
  while (await db.invitation.findUnique({ where: { code } })) {
    code = generateInviteCode();
  }

  const invitation = await db.invitation.create({
    data: {
      companyId: admin.companyId,
      createdById: admin.id,
      code,
      displayCode: formatInviteCode(code),
      type: parsed.data.type,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      maxUses: parsed.data.maxUses ?? (parsed.data.type === "SINGLE_USE" ? 1 : null),
      departmentId: parsed.data.departmentId,
      jobTitle: parsed.data.jobTitle,
      assignRole: parsed.data.assignRole
    }
  });

  await writeAuditLog({
    userId: admin.id,
    companyId: admin.companyId,
    action: "invitation.create",
    description: `Создано приглашение ${invitation.displayCode}`
  });

  return NextResponse.json({ invitation });
}
