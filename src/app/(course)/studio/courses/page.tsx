import Link from "next/link";
import { db } from "@/lib/db";
import { requireApproved } from "@/lib/session";

export default async function StudioCoursesPage() {
  await requireApproved();
  const courses = await db.course.findMany({ orderBy: { order: "asc" } });
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Studio</span>
        <h1 className="course-title">Мои курсы</h1>
        <p className="course-lead">Редактируйте структуру и уроки через текущую CMS и будущий block builder.</p>
      </header>
      <section className="lms-course-grid">
        {courses.map((course) => (
          <Link className="lms-course-card" href={`/studio/courses/${course.id}/edit`} key={course.id}>
            <div className="lms-course-card__accent" style={{ background: course.accentColor }} />
            <h2>{course.title}</h2>
            <p className="lesson-text">{course.description}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
