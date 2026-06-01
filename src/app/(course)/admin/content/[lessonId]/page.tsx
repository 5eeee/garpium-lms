import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { LessonEditForm } from "@/components/LessonEditForm";

export const dynamic = "force-dynamic";

export default async function AdminLessonEditPage({ params }: { params: Promise<{ lessonId: string }> }) {
  await requireAdmin();
  const { lessonId } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { tasks: true, module: { include: { course: true } } }
  });
  if (!lesson) notFound();

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">CMS / {lesson.id}</span>
        <h1 className="course-title">Редактирование урока</h1>
        <p className="course-lead">
          {lesson.module.course.title} → {lesson.module.title}
        </p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-12">
          <LessonEditForm
            lesson={{
              ...lesson,
              content: lesson.content as { theory?: string; simple?: string },
              visual: lesson.visual as { type?: string } | null
            }}
          />
        </article>
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/admin/content">← К списку уроков</Link>
      </footer>
    </>
  );
}
