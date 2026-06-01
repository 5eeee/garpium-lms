import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";
import { DepartmentCreateForm } from "@/components/DepartmentCreateForm";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function CompanyDepartmentsPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  const departments = await db.department.findMany({
    where: { companyId: company.id },
    orderBy: { name: "asc" }
  });

  const verified = company.verificationStatus === "VERIFIED";

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Company</span>
        <h1 className="course-title">Отделы и структура</h1>
        <p className="course-lead">Отделы, подразделения, группы, команды и филиалы организации.</p>
      </header>

      <section className="lesson-grid">
        {verified ? (
          <article className="lesson-card span-12">
            <span className="card-label">Новый отдел</span>
            <DepartmentCreateForm />
          </article>
        ) : null}

        <article className="lesson-card span-12">
          <span className="card-label">Структура</span>
          {departments.length ? (
            departments.map((dept) => (
              <div className="admin-row" key={dept.id}>
                <span>
                  {dept.name}
                  <small>{dept.type}</small>
                </span>
              </div>
            ))
          ) : (
            <p className="lesson-text">Структура пока пуста. Добавьте первый отдел.</p>
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
