import Link from "next/link";
import type { Lesson as DbLesson, Module } from "@prisma/client";
import { db } from "@/lib/db";
import { lessons } from "@/lib/course-data";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

type DbLessonWithModule = DbLesson & {
  module: Module;
};

export default async function AdminContentPage() {
  await requireAdmin();
  const dbLessons = await db.lesson.findMany({
    orderBy: { order: "asc" },
    include: { module: { include: { course: true } } }
  });

  const rows = dbLessons.length
    ? dbLessons
    : lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        module: { title: lesson.module, course: { title: lesson.track.toUpperCase() } }
      }));

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">CMS</span>
        <h1 className="course-title">Контент курса</h1>
        <p className="course-lead">
          {dbLessons.length} уроков в базе. Нажмите «Редактировать», чтобы изменить текст, задание и ответы.
        </p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-6">
          <span className="card-label">База</span>
          <h2>{dbLessons.length}</h2>
          <p className="lesson-text">уроков синхронизировано</p>
        </article>
        <article className="lesson-card span-6">
          <span className="card-label">Seed</span>
          <h2>{lessons.length}</h2>
          <p className="lesson-text">уроков в исходных данных</p>
        </article>
      </section>

      <section className="content-table">
        {rows.map((lesson) => (
          <div className="content-row" key={lesson.id}>
            <span>{lesson.id}</span>
            <strong>{lesson.title}</strong>
            <Link href={`/admin/content/${lesson.id}`}>Редактировать</Link>
          </div>
        ))}
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/admin">← Админка</Link>
      </footer>
    </>
  );
}
