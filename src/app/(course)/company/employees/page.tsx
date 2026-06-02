import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyPanel, getCompanyForPanel, getSession } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";
import { CompanyMemberActions } from "@/components/CompanyMemberActions";
import { isCompanyAdmin, roleLabel } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function CompanyEmployeesPage() {
  await requireCompanyPanel();
  const session = await getSession();
  const canManage = isCompanyAdmin(session?.user?.role);
  const company = await getCompanyForPanel();
  if (!company) return null;

  const members = await db.organizationMember.findMany({
    where: { companyId: company.id },
    include: {
      user: { include: { progress: { where: { status: "DONE" } } } },
      department: true
    },
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
          <div className="company-toolbar">
            <span className="card-label">Команда</span>
            <span>{members.length} сотрудников</span>
          </div>
          {members.length ? (
            members.map((member) => (
              <div className="admin-row" key={member.id}>
                <span>
                  {member.user.firstName} {member.user.lastName}
                  <small>
                    {member.user.email} · {roleLabel(member.orgRole)} · {member.status}
                    {member.department ? ` · ${member.department.name}` : ""}
                    {` · ${member.user.progress.length} уроков`}
                  </small>
                </span>
                {canManage ? (
                  <CompanyMemberActions
                    currentRole={member.orgRole}
                    currentStatus={member.status}
                    memberId={member.id}
                  />
                ) : null}
              </div>
            ))
          ) : (
            <p className="lesson-text">
              {canManage ? (
                <>
                  Пока нет сотрудников.{" "}
                  <Link href="/company/invitations">Создайте приглашение</Link>.
                </>
              ) : (
                "Пока нет сотрудников в вашей зоне видимости."
              )}
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
