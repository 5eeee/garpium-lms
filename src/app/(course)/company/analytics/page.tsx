import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyPanel, getCompanyForPanel } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function CompanyAnalyticsPage() {
  await requireCompanyPanel();
  const company = await getCompanyForPanel();
  if (!company) return null;

  const [members, doneProgress, assignments, certificates, auditLogs] = await Promise.all([
    db.organizationMember.findMany({
      where: { companyId: company.id, status: "ACTIVE" },
      include: {
        user: {
          include: {
            progress: { where: { status: "DONE" } }
          }
        },
        department: true
      }
    }),
    db.progress.count({ where: { user: { companyId: company.id }, status: "DONE" } }),
    db.courseAssignment.count({ where: { companyId: company.id } }),
    db.certificate.count({ where: { user: { companyId: company.id }, status: "ISSUED" } }),
    db.auditLog.findMany({ where: { companyId: company.id }, orderBy: { createdAt: "desc" }, take: 6 })
  ]);

  const completionPercent = members.length > 0 ? Math.min(100, Math.round((doneProgress / (members.length * 10)) * 100)) : 0;
  const topMembers = [...members]
    .sort((a, b) => b.user.progress.length - a.user.progress.length)
    .slice(0, 5);

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Company</span>
        <h1 className="course-title">Аналитика</h1>
        <p className="course-lead">Прогресс обучения, активность отделов и успеваемость сотрудников.</p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-4">
          <span className="card-label">Завершение</span>
          <h2>{completionPercent}%</h2>
          <div className="dash-progress" aria-hidden>
            <span style={{ width: `${completionPercent}%` }} />
          </div>
        </article>
        <article className="lesson-card span-4">
          <span className="card-label">Назначения</span>
          <h2>{assignments}</h2>
          <p className="lesson-text">Активные назначения курсов</p>
        </article>
        <article className="lesson-card span-4">
          <span className="card-label">Сертификаты</span>
          <h2>{certificates}</h2>
          <p className="lesson-text">Выдано сотрудникам</p>
        </article>

        <article className="lesson-card span-6">
          <span className="card-label">Рейтинг сотрудников</span>
          {topMembers.length ? (
            topMembers.map((member) => (
              <div className="admin-row" key={member.id}>
                <span>
                  {member.user.firstName} {member.user.lastName}
                  <small>{member.department?.name || "Без отдела"}</small>
                </span>
                <strong>{member.user.progress.length}</strong>
              </div>
            ))
          ) : (
            <p className="lesson-text">Нет данных по прогрессу.</p>
          )}
        </article>

        <article className="lesson-card span-6">
          <span className="card-label">Последние действия</span>
          {auditLogs.length ? (
            auditLogs.map((log) => (
              <div className="admin-row" key={log.id}>
                <span>
                  {log.description}
                  <small>{log.createdAt.toLocaleDateString("ru-RU")}</small>
                </span>
              </div>
            ))
          ) : (
            <p className="lesson-text">Журнал пока пуст.</p>
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
