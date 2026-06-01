import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonSections } from "@/components/LessonSections";
import { LessonVisual } from "@/components/LessonVisual";
import { getAdjacentLesson, getLesson } from "@/lib/course-data";
import { db } from "@/lib/db";
import { requireApproved } from "@/lib/session";
import { CodeEditor } from "@/components/CodeEditor";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  await requireApproved();
  const { lessonId } = await params;
  const base = getLesson(lessonId);
  if (!base) notFound();

  const dbLesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { tasks: true }
  });

  const lesson = { ...base };
  if (dbLesson?.tasks[0]) {
    lesson.task = {
      type: dbLesson.tasks[0].type.toLowerCase() as "html" | "css",
      label: dbLesson.tasks[0].label,
      starter: dbLesson.tasks[0].starter,
      preview: dbLesson.tasks[0].preview,
      primary: dbLesson.tasks[0].primary,
      acceptable: dbLesson.tasks[0].acceptable,
      wrongHints: dbLesson.tasks[0].wrongHints as { pattern: string; msg: string }[]
    };
  }

  const content = dbLesson?.content as { theory?: string; sections?: typeof lesson.sections } | undefined;
  const sections = content?.sections || lesson.sections || [];
  const prev = getAdjacentLesson(lesson.id, "prev");
  const next = getAdjacentLesson(lesson.id, "next");

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">
          {lesson.track.toUpperCase()} / {lesson.order}/60 · {lesson.module}
        </span>
        <h1 className="course-title">{lesson.title}</h1>
        <p className="course-lead">{lesson.simple}</p>
        {lesson.learn?.length ? (
          <ul className="lesson-text">
            {lesson.learn.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-6">
          <span className="card-label">Визуал</span>
          <h2>Как это выглядит</h2>
          <LessonVisual lesson={lesson} />
        </article>

        {lesson.project ? (
          <article className="lesson-card span-6">
            <span className="card-label">Проект</span>
            <h2>Шаг {lesson.project.step}</h2>
            <p className="lesson-text">{lesson.project.text}</p>
          </article>
        ) : null}

        <LessonSections sections={sections} />

        <article className="lesson-card span-12">
          <CodeEditor lesson={lesson} />
        </article>
      </section>

      <footer className="course-footer course-footer--lesson">
        {prev ? (
          <Link className="course-button" href={`/lessons/${prev.id}`}>
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="course-button is-primary" href={`/lessons/${next.id}`}>
            {next.title} →
          </Link>
        ) : (
          <Link className="course-button is-primary" href="/dashboard">
            В кабинет
          </Link>
        )}
      </footer>
    </>
  );
}
