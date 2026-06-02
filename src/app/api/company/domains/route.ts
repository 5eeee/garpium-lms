import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/session";
import { domainCreateSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await requireCompanyAdmin();
  const admin = await db.user.findUnique({ where: { email: session.user.email! }, select: { id: true, companyId: true } });
  if (!admin?.companyId) return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });

  const parsed = domainCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректный домен." }, { status: 400 });

  const domain = await db.organizationDomain.create({
    data: { companyId: admin.companyId, domain: parsed.data.domain }
  });

  await writeAuditLog({
    userId: admin.id,
    companyId: admin.companyId,
    action: "domain.create",
    description: `Добавлен домен ${domain.domain}`
  });

  return NextResponse.json({ domain });
}
