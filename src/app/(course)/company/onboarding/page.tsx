import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";

const days = [
  ["День 1", "Знакомство с компанией"],
  ["День 2", "Регламенты и процессы"],
  ["День 3", "Инструменты и доступы"],
  ["День 4", "Проверка знаний"],
  ["День 5", "Аттестация"]
];

export default async function CompanyOnboardingPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Onboarding</span>
        <h1 className="course-title">Адаптация сотрудников</h1>
        <p className="course-lead">Шаблоны первых дней, задачи, уроки, Wiki-ссылки и итоговая аттестация.</p>
      </header>
      <section className="roadmap-path">
        <div className="roadmap-path__spine" aria-hidden />
        {days.map(([day, title], index) => (
          <article className="roadmap-path__module" key={day}>
            <div className="roadmap-path__milestone">
              <span className="roadmap-path__milestone-dot">{index + 1}</span>
              <h2 className="roadmap-path__milestone-title">{day}</h2>
            </div>
            <ol className="roadmap-path__nodes">
              <li className={`roadmap-path__node roadmap-path__node--${index % 2 === 0 ? "left" : "right"}`}>
                <div className="roadmap-path__link">
                  <span className="roadmap-path__number">{index + 1}</span>
                  <span className="roadmap-path__card">
                    <strong>{title}</strong>
                    <p>Шаг шаблона адаптации для новых сотрудников.</p>
                  </span>
                </div>
              </li>
            </ol>
          </article>
        ))}
      </section>
    </>
  );
}
