import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";

const integrations = [
  "Telegram",
  "Slack",
  "Bitrix24",
  "AmoCRM",
  "Jira",
  "GitHub",
  "Google Workspace",
  "Microsoft 365"
];

export default async function CompanyIntegrationsPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Integrations</span>
        <h1 className="course-title">Интеграции</h1>
        <p className="course-lead">Подключения к HRM, мессенджерам и CRM — в разработке.</p>
      </header>
      <section className="lesson-grid">
        {integrations.map((name) => (
          <article className="lesson-card span-4" key={name}>
            <span className="card-label">Connector</span>
            <h2>{name}</h2>
            <p className="lesson-text">Планируется: webhooks, API-ключи, синхронизация сотрудников.</p>
            <span className="dash-company-tag">Скоро</span>
          </article>
        ))}
      </section>
    </>
  );
}
