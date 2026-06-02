import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CompanyProgramsPage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  const courses = await db.course.findMany({ orderBy: { order: "asc" }, take: 8 });

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Learning Paths</span>
        <h1 className="course-title">Учебные программы</h1>
        <p className="course-lead">Собирайте последовательности курсов: onboarding, профессии, аттестации.</p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-12">
          <span className="card-label">Frontend Developer — шаблон</span>
          <h2>HTML → CSS → JavaScript → Git → React → Экзамен</h2>
          <p className="lesson-text">Вертикальная траектория будет использовать уже подключённые курсы компании.</p>
          <div className="course-footer">
            {courses.slice(0, 5).map((course) => (
              <Link className="course-button" href={`/learn/${course.slug}`} key={course.id}>
                {course.title}
              </Link>
            ))}
          </div>
        </article>
        <article className="explain-card span-12">
          <h2>Редактор траекторий</h2>
          <p className="lesson-text">
            Следующий шаг: drag-and-drop узлы, prerequisites, дедлайны и автоматическая выдача сертификата.
          </p>
        </article>
      </section>
    </>
  );
}
