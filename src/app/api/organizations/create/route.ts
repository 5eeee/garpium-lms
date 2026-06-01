import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { organizationCreateSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

function slugFromName(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return base || "company";
}

export async function POST(request: Request) {
  const session = await requireSession();
  const body = await request.json().catch(() => null);
  const parsed = organizationCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Заполните все обязательные поля организации." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "Пользователь не найден." }, { status: 404 });
  if (user.companyId) {
    return NextResponse.json({ error: "Вы уже состоите в организации." }, { status: 409 });
  }

  let slug = parsed.data.slug || slugFromName(parsed.data.name);
  let suffix = 0;
  while (await db.company.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${slugFromName(parsed.data.name)}-${suffix}`;
  }

  const company = await db.$transaction(async (tx) => {
    const created = await tx.company.create({
      data: {
        name: parsed.data.name,
        slug,
        inn: parsed.data.inn,
        legalName: parsed.data.legalName,
        legalAddress: parsed.data.legalAddress,
        corporateEmail: parsed.data.corporateEmail,
        additionalInfo: parsed.data.additionalInfo,
        verificationStatus: "PENDING_VERIFICATION",
        ownerId: user.id
      }
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        companyId: created.id,
        role: "COMPANY_OWNER",
        approvalStatus: "APPROVED",
        approvedAt: new Date()
      }
    });

    await tx.organizationMember.create({
      data: {
        userId: user.id,
        companyId: created.id,
        orgRole: "COMPANY_OWNER",
        status: "PENDING"
      }
    });

    return created;
  });

  await writeAuditLog({
    userId: user.id,
    companyId: company.id,
    action: "organization.create",
    description: `Создана организация «${company.name}» (ожидает верификации)`
  });

  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      verificationStatus: company.verificationStatus
    },
    message: "Заявка на создание компании отправлена. Корпоративные функции откроются после проверки."
  });
}
