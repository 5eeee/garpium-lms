import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/session";
import { departmentCreateSchema } from "@/lib/validators";
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

  const departments = await db.department.findMany({
    where: { companyId: admin.companyId },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({ departments });
}

export async function POST(request: Request) {
  const session = await requireCompanyAdmin();
  const admin = await db.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, companyId: true }
  });

  if (!admin?.companyId) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = departmentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте название отдела." }, { status: 400 });
  }

  const department = await db.department.create({
    data: {
      companyId: admin.companyId,
      name: parsed.data.name,
      type: parsed.data.type,
      parentId: parsed.data.parentId
    }
  });

  await writeAuditLog({
    userId: admin.id,
    companyId: admin.companyId,
    action: "department.create",
    description: `Создан отдел «${department.name}»`
  });

  return NextResponse.json({ department });
}
