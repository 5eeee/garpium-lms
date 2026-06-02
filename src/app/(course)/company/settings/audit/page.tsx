import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CompanyAuditPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  const logs = await db.auditLog.findMany({
    where: { companyId: company.id },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Безопасность</span>
        <h1 className="course-title">Журнал действий</h1>
        <p className="course-lead">Изменение прав, приглашения, отделы, заявки и действия администраторов.</p>
      </header>

      <section className="lesson-card">
        {logs.length ? (
          logs.map((log) => (
            <div className="admin-row" key={log.id}>
              <span>
                {log.description}
                <small>
                  {log.action} · {log.user?.email || "system"} · {log.createdAt.toLocaleString("ru-RU")}
                  {log.ip ? ` · ${log.ip}` : ""}
                </small>
              </span>
            </div>
          ))
        ) : (
          <p className="lesson-text">Журнал пока пуст.</p>
        )}
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/company/settings">
          ← Настройки
        </Link>
      </footer>
    </>
  );
}
