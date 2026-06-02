import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireApproved } from "@/lib/session";

export default async function StudioCourseEditPage({ params }: { params: Promise<{ courseId: string }> }) {
  await requireApproved();
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: true }, orderBy: { order: "asc" } } }
  });
  if (!course) notFound();

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Course</span>
        <h1 className="course-title">{course.title}</h1>
        <p className="course-lead">Структура курса и переход к урокам.</p>
      </header>
      <section className="studio-layout">
        <aside className="lesson-card">
          <span className="card-label">Модули</span>
          {course.modules.map((module) => (
            <div className="admin-row" key={module.id}>
              <span>
                {module.title}
                <small>{module.lessons.length} уроков</small>
              </span>
            </div>
          ))}
        </aside>
        <main className="lesson-card">
          <span className="card-label">Уроки</span>
          <h2>Просмотр и редактирование</h2>
          <ul className="dash-list">
            {course.modules.flatMap((m) =>
              m.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <span>{lesson.title}</span>
                  <span>
                    <Link className="course-button" href={`/lessons/${lesson.id}`}>
                      Открыть
                    </Link>
                    <Link className="course-button" href={`/admin/content/${lesson.id}`}>
                      CMS
                    </Link>
                  </span>
                </li>
              ))
            )}
          </ul>
        </main>
      </section>
      <footer className="course-footer">
        <Link className="course-button" href="/studio/courses">
          ← К списку курсов
        </Link>
      </footer>
    </>
  );
}
