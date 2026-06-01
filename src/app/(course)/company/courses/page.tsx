import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";
import { CourseAssignmentForm, CourseAssignmentRemoveButton } from "@/components/CourseAssignmentForm";
import { assignmentScopeLabel } from "@/lib/course-access";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function CompanyCoursesPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  const verified = company.verificationStatus === "VERIFIED";

  const [courses, departments, members, assignments] = await Promise.all([
    db.course.findMany({ orderBy: { order: "asc" } }),
    db.department.findMany({ where: { companyId: company.id }, orderBy: { name: "asc" } }),
    db.organizationMember.findMany({
      where: { companyId: company.id, status: "ACTIVE" },
      include: { user: true }
    }),
    db.courseAssignment.findMany({
      where: { companyId: company.id },
      include: { course: true, department: true, user: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const courseOptions = courses.map((c) => ({ id: c.slug, label: c.title }));
  const deptOptions = departments.map((d) => ({ id: d.id, label: d.name }));
  const employeeOptions = members.map((m) => ({
    id: m.userId,
    label: `${m.user.firstName} ${m.user.lastName}`
  }));

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Company</span>
        <h1 className="course-title">Курсы</h1>
        <p className="course-lead">
          Назначайте обучение всей компании, отделу или конкретному сотруднику.
        </p>
      </header>

      <section className="lesson-grid">
        {verified ? (
          <article className="lesson-card span-12">
            <span className="card-label">Новое назначение</span>
            {courseOptions.length ? (
              <CourseAssignmentForm
                courses={courseOptions}
                departments={deptOptions}
                employees={employeeOptions}
              />
            ) : (
              <p className="lesson-text">В каталоге пока нет курсов.</p>
            )}
            {!deptOptions.length ? (
              <p className="lesson-text">
                Для назначения по отделам создайте структуру в{" "}
                <Link href="/company/departments">Отделы</Link>.
              </p>
            ) : null}
          </article>
        ) : (
          <article className="explain-card span-12">
            <h2>Верификация не завершена</h2>
            <p className="lesson-text">Назначение курсов доступно после подтверждения организации.</p>
          </article>
        )}

        <article className="lesson-card span-12">
          <span className="card-label">Активные назначения</span>
          <h2>{assignments.length}</h2>
          {assignments.length ? (
            assignments.map((a) => (
              <div className="admin-row" key={a.id}>
                <span>
                  <strong>{a.course.title}</strong>
                  <small>
                    {assignmentScopeLabel(a.scope)}
                    {a.department ? ` · ${a.department.name}` : ""}
                    {a.user ? ` · ${a.user.firstName} ${a.user.lastName}` : ""}
                  </small>
                </span>
                <CourseAssignmentRemoveButton id={a.id} />
              </div>
            ))
          ) : (
            <p className="lesson-text">
              {verified
                ? "Назначений пока нет — все курсы доступны сотрудникам по умолчанию."
                : "Нет назначений."}
            </p>
          )}
        </article>
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/company">
          ← Дашборд
        </Link>
        <LogoutButton />
      </footer>
    </>
  );
}
