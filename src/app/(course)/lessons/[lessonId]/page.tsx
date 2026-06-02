import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { canUserAccessCourse } from "@/lib/learning";
import { TaskPractice } from "@/components/learning/TaskPractice";

export const dynamic = "force-dynamic";

function textFromContent(content: unknown, fallback: string) {
  if (content && typeof content === "object" && "theory" in content) {
    const theory = (content as { theory?: unknown }).theory;
    if (typeof theory === "string" && theory.trim()) return theory;
  }
  return fallback;
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const [{ lessonId }, session] = await Promise.all([params, requireSession()]);
  const [user, lesson] = await Promise.all([
    db.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true, memberships: { where: { status: "ACTIVE" } } }
    }),
    db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        tasks: true,
        progress: { where: { userId: session.user.id! } },
        module: { include: { course: { include: { modules: { include: { lessons: true } } } } } }
      }
    })
  ]);

  if (!user) redirect("/login");
  if (!lesson) notFound();
  if (!(await canUserAccessCourse(user, lesson.module.course.slug))) redirect("/learn");

  if (lesson.progress[0]?.status !== "DONE") {
    await db.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      update: { status: "IN_PROGRESS" },
      create: { userId: user.id, lessonId: lesson.id, status: "IN_PROGRESS" }
    });
  }

  const orderedLessons = lesson.module.course.modules
    .flatMap((module) => module.lessons)
    .sort((a, b) => a.order - b.order);
  const index = orderedLessons.findIndex((item) => item.id === lesson.id);
  const prev = orderedLessons[index - 1] ?? null;
  const next = orderedLessons[index + 1] ?? null;
  const task = lesson.tasks[0] ?? null;

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">{lesson.module.course.title}</span>
        <h1 className="course-title">{lesson.title}</h1>
        <p className="course-lead">{lesson.simple}</p>
        <Link className="course-button" href={`/learn/${lesson.module.course.slug}`}>
          ← К программе
        </Link>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-8">
          <span className="card-label">Теория</span>
          <div className="lesson-readable">
            {textFromContent(lesson.content, lesson.simple)
              .split("\n")
              .filter(Boolean)
              .map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
          </div>
        </article>

        <aside className="explain-card span-4">
          <span className="card-label">Контекст</span>
          <h2>{lesson.module.title}</h2>
          <p className="lesson-text">
            Урок даёт {lesson.points} очков. После успешной практики прогресс сохранится автоматически.
          </p>
        </aside>

        {task ? (
          <div className="span-12">
            <TaskPractice
              task={{
                id: task.id,
                label: task.label,
                starter: task.starter,
                preview: task.preview,
                maxLength: task.maxLength
              }}
            />
          </div>
        ) : (
          <article className="lesson-card span-12">
            <span className="card-label">Завершение</span>
            <h2>Практика не требуется</h2>
            <p className="lesson-text">Этот урок можно завершить просмотром. Практические задания появятся позже.</p>
          </article>
        )}
      </section>

      <footer className="course-footer">
        {prev ? (
          <Link className="course-button" href={`/lessons/${prev.id}`}>
            ← Предыдущий
          </Link>
        ) : null}
        {next ? (
          <Link className="course-button is-accent" href={`/lessons/${next.id}`}>
            Следующий →
          </Link>
        ) : (
          <Link className="course-button is-accent" href={`/learn/${lesson.module.course.slug}`}>
            К программе
          </Link>
        )}
      </footer>
    </>
  );
}
