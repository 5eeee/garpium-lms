import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";
import { verificationLabel } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function CompanySettingsPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  const domains = await db.organizationDomain.findMany({
    where: { companyId: company.id },
    orderBy: { domain: "asc" }
  });

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Company</span>
        <h1 className="course-title">Настройки компании</h1>
        <p className="course-lead">{company.name}</p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-12">
          <span className="card-label">Верификация</span>
          <h2>{verificationLabel(company.verificationStatus)}</h2>
          {company.inn ? <p className="lesson-text">ИНН: {company.inn}</p> : null}
          {company.legalName ? <p className="lesson-text">Юр. название: {company.legalName}</p> : null}
          {company.corporateEmail ? <p className="lesson-text">Email: {company.corporateEmail}</p> : null}
        </article>

        <article className="lesson-card span-12">
          <span className="card-label">Корпоративные домены</span>
          <h2>{domains.length}</h2>
          {domains.length ? (
            domains.map((item) => (
              <div className="admin-row" key={item.id}>
                <span>
                  {item.domain}
                  <small>{item.verified ? "подтверждён" : "ожидает"}</small>
                </span>
              </div>
            ))
          ) : (
            <p className="lesson-text">
              Добавление доменов для автопредложения вступления — в следующем обновлении.
            </p>
          )}
        </article>

        <article className="explain-card span-12">
          <h2>White-label</h2>
          <p className="lesson-text">
            Логотип: {company.logoUrl || "не задан"} · Цвета HTML/CSS: {company.brandHtml} / {company.brandCss}
          </p>
          <p className="lesson-text">Powered by Garpium — всегда отображается в интерфейсе.</p>
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
