import Link from "next/link";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function CompanyAnalyticsPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Company</span>
        <h1 className="course-title">Аналитика</h1>
        <p className="course-lead">Прогресс обучения, активность отделов и успеваемость сотрудников.</p>
      </header>

      <section className="lesson-grid">
        <article className="explain-card span-12">
          <h2>Скоро</h2>
          <p className="lesson-text">
            Корпоративная аналитика (прогресс, завершение курсов, рейтинг отделов) подключается на следующем
            этапе разработки.
          </p>
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
