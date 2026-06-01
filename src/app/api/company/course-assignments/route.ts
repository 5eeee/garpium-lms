import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/session";
import { courseAssignmentSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await requireCompanyAdmin();
  const admin = await db.user.findUnique({
    where: { email: session.user.email! },
    include: { company: true }
  });

  if (!admin?.companyId || !admin.company) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }

  const assignments = await db.courseAssignment.findMany({
    where: { companyId: admin.companyId },
    include: {
      course: true,
      department: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ assignments });
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
    return NextResponse.json({ error: "Назначение курсов доступно после верификации." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = courseAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте параметры назначения." }, { status: 400 });
  }

  const course = await db.course.findUnique({ where: { slug: parsed.data.courseSlug } });
  if (!course) {
    return NextResponse.json({ error: "Курс не найден." }, { status: 404 });
  }

  if (parsed.data.scope === "DEPARTMENT" && !parsed.data.departmentId) {
    return NextResponse.json({ error: "Выберите отдел." }, { status: 400 });
  }

  if (parsed.data.scope === "USER" && !parsed.data.userId) {
    return NextResponse.json({ error: "Выберите сотрудника." }, { status: 400 });
  }

  if (parsed.data.departmentId) {
    const dept = await db.department.findFirst({
      where: { id: parsed.data.departmentId, companyId: admin.companyId }
    });
    if (!dept) return NextResponse.json({ error: "Отдел не найден." }, { status: 404 });
  }

  if (parsed.data.userId) {
    const member = await db.organizationMember.findFirst({
      where: { userId: parsed.data.userId, companyId: admin.companyId, status: "ACTIVE" }
    });
    if (!member) return NextResponse.json({ error: "Сотрудник не найден." }, { status: 404 });
  }

  const assignment = await db.courseAssignment.create({
    data: {
      companyId: admin.companyId,
      courseId: course.id,
      scope: parsed.data.scope,
      departmentId: parsed.data.scope === "DEPARTMENT" ? parsed.data.departmentId : null,
      userId: parsed.data.scope === "USER" ? parsed.data.userId : null,
      assignedById: admin.id
    },
    include: { course: true, department: true, user: true }
  });

  await writeAuditLog({
    userId: admin.id,
    companyId: admin.companyId,
    action: "course.assign",
    description: `Назначен курс «${course.title}» (${parsed.data.scope})`
  });

  return NextResponse.json({ assignment });
}

export async function DELETE(request: Request) {
  const session = await requireCompanyAdmin();
  const admin = await db.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, companyId: true }
  });

  if (!admin?.companyId) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Укажите id назначения." }, { status: 400 });

  const existing = await db.courseAssignment.findFirst({
    where: { id, companyId: admin.companyId },
    include: { course: true }
  });

  if (!existing) {
    return NextResponse.json({ error: "Назначение не найдено." }, { status: 404 });
  }

  await db.courseAssignment.delete({ where: { id } });

  await writeAuditLog({
    userId: admin.id,
    companyId: admin.companyId,
    action: "course.unassign",
    description: `Снято назначение курса «${existing.course.title}»`
  });

  return NextResponse.json({ ok: true });
}
