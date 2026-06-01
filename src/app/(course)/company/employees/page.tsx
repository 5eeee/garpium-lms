import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";
import { roleLabel } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function CompanyEmployeesPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  const members = await db.organizationMember.findMany({
    where: { companyId: company.id },
    include: { user: true, department: true },
    orderBy: { joinedAt: "desc" }
  });

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Company</span>
        <h1 className="course-title">Сотрудники</h1>
        <p className="course-lead">{company.name}</p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-12">
          {members.length ? (
            members.map((member) => (
              <div className="admin-row" key={member.id}>
                <span>
                  {member.user.firstName} {member.user.lastName}
                  <small>
                    {member.user.email} · {roleLabel(member.orgRole)} · {member.status}
                    {member.department ? ` · ${member.department.name}` : ""}
                  </small>
                </span>
              </div>
            ))
          ) : (
            <p className="lesson-text">Пока нет сотрудников. Создайте приглашение в разделе «Приглашения».</p>
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
