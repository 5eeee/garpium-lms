import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  orgRole: z.enum(["COMPANY_OWNER", "COMPANY_ADMIN", "COMPANY_MANAGER", "COMPANY_EMPLOYEE"]).optional(),
  departmentId: z.string().cuid().nullable().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ memberId: string }> }) {
  const session = await requireCompanyAdmin();
  const { memberId } = await context.params;
  const admin = await db.user.findUnique({ where: { email: session.user.email! }, select: { id: true, companyId: true } });
  if (!admin?.companyId) return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Проверьте данные сотрудника." }, { status: 400 });

  const member = await db.organizationMember.findFirst({
    where: { id: memberId, companyId: admin.companyId },
    include: { user: true }
  });
  if (!member) return NextResponse.json({ error: "Сотрудник не найден." }, { status: 404 });

  const updated = await db.organizationMember.update({
    where: { id: member.id },
    data: parsed.data,
    include: { user: true, department: true }
  });

  if (parsed.data.orgRole) {
    await db.user.update({
      where: { id: member.userId },
      data: { role: parsed.data.orgRole }
    });
  }

  await writeAuditLog({
    userId: admin.id,
    companyId: admin.companyId,
    action: "member.update",
    description: `Обновлён сотрудник ${member.user.email}`
  });

  return NextResponse.json({ member: updated });
}
