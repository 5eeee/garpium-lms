import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdmin();
  const dbLessons = await db.lesson.findMany({
    orderBy: { order: "asc" },
    include: { module: { include: { course: true } } }
  });

  const courses = await db.course.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">CMS</span>
        <h1 className="course-title">Контент</h1>
        <p className="course-lead">
          Курсы и уроки создаются в базе. Статические HTML/CSS треки удалены — добавляйте программы через
          админку или API.
        </p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-6">
          <span className="card-label">Курсы в БД</span>
          <h2>{courses.length}</h2>
          {courses.length === 0 ? (
            <p className="lesson-text">Пока нет курсов. Создайте запись Course в Prisma / будущем редакторе.</p>
          ) : (
            <ul className="lesson-list">
              {courses.map((c) => (
                <li key={c.id}>
                  <strong>{c.title}</strong> ({c.slug})
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="lesson-card span-6">
          <span className="card-label">Уроки</span>
          <h2>{dbLessons.length}</h2>
          <p className="lesson-text">Редактирование доступно для уроков в базе.</p>
        </article>

        {dbLessons.length > 0 ? (
          <article className="lesson-card span-12">
            <div className="content-table">
              {dbLessons.map((lesson) => (
                <div className="content-row" key={lesson.id}>
                  <span>{lesson.order}</span>
                  <div>
                    <strong>{lesson.title}</strong>
                    <p className="lesson-text">
                      {lesson.module.course.title} · {lesson.module.title}
                    </p>
                  </div>
                  <Link href={`/admin/content/${lesson.id}`}>Редактировать</Link>
                </div>
              ))}
            </div>
          </article>
        ) : null}
      </section>
    </>
  );
}
