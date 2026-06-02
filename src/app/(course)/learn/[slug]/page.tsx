import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { canUserAccessCourse, courseProgress, getCourseDoneLessonIds } from "@/lib/learning";

export const dynamic = "force-dynamic";

export default async function CourseRoadmapPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, session] = await Promise.all([params, requireSession()]);
  const [user, course] = await Promise.all([
    db.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true, memberships: { where: { status: "ACTIVE" } } }
    }),
    db.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" } } }
        }
      }
    })
  ]);

  if (!user) redirect("/login");
  if (!course) notFound();
  if (!(await canUserAccessCourse(user, course.slug))) redirect("/learn");

  const lessons = course.modules.flatMap((module) => module.lessons);
  const doneLessonIds = await getCourseDoneLessonIds(user.id, lessons.map((lesson) => lesson.id));
  const progress = courseProgress({ doneLessonIds, totalLessons: lessons.length });
  const firstOpenLesson = lessons.find((lesson) => !doneLessonIds.has(lesson.id)) ?? lessons[0];

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Курс</span>
        <h1 className="course-title">{course.title}</h1>
        <p className="course-lead">{course.description || "Программа обучения Garpium Academy."}</p>
        <div className="dash-continue__track" style={{ maxWidth: 360 }}>
          <div className="dash-progress" aria-hidden>
            <span style={{ width: `${progress.percent}%` }} />
          </div>
          <span className="card-label">
            {progress.done}/{progress.total} уроков · {progress.percent}%
          </span>
        </div>
        {firstOpenLesson ? (
          <Link className="course-button is-accent" href={`/lessons/${firstOpenLesson.id}`}>
            Продолжить →
          </Link>
        ) : null}
      </header>

      {course.modules.length > 0 ? (
        <section className="roadmap-path">
          <div className="roadmap-path__spine" aria-hidden />
          {course.modules.map((module, moduleIndex) => (
            <article className="roadmap-path__module" key={module.id}>
              <div className="roadmap-path__milestone">
                <span className="roadmap-path__milestone-dot">{moduleIndex + 1}</span>
                <h2 className="roadmap-path__milestone-title">{module.title}</h2>
              </div>
              <ol className="roadmap-path__nodes">
                {module.lessons.map((lesson, index) => {
                  const isDone = doneLessonIds.has(lesson.id);
                  return (
                    <li
                      className={`roadmap-path__node roadmap-path__node--${index % 2 === 0 ? "left" : "right"}`}
                      key={lesson.id}
                    >
                      <Link className="roadmap-path__link" href={`/lessons/${lesson.id}`}>
                        <span className="roadmap-path__number">{isDone ? "✓" : lesson.order}</span>
                        <span className="roadmap-path__card">
                          <strong>{lesson.title}</strong>
                          <p>{lesson.simple}</p>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
        </section>
      ) : (
        <section className="explain-card">
          <h2>Уроки скоро появятся</h2>
          <p className="lesson-text">Администратор наполняет программу в конструкторе контента.</p>
        </section>
      )}
    </>
  );
}
