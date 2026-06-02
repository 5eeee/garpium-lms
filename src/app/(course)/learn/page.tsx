import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getAccessibleCourseSlugs } from "@/lib/course-access";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const session = await requireSession();
  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    include: {
      company: true,
      memberships: { where: { status: "ACTIVE" } }
    }
  });

  const access =
    user && user.company
      ? await getAccessibleCourseSlugs({
          id: user.id,
          companyId: user.companyId,
          company: user.company,
          memberships: user.memberships
        })
      : "all";

  const allCourses = await db.course.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        include: { lessons: { select: { id: true } } }
      }
    }
  });
  const courses =
    access === "all"
      ? allCourses
      : allCourses.filter((c) => Array.isArray(access) && access.includes(c.slug));

  const lessonIds = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
  const doneRows = user
    ? await db.progress.findMany({
        where: { userId: user.id, lessonId: { in: lessonIds }, status: "DONE" },
        select: { lessonId: true }
      })
    : [];
  const done = new Set(doneRows.map((row) => row.lessonId));

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Обучение</span>
        <h1 className="course-title">Ваши курсы</h1>
        <p className="course-lead">
          Корпоративная академия Garpium LMS. Курсы подключаются администратором компании или платформы.
        </p>
      </header>

      {courses.length > 0 ? (
        <div className="lms-course-grid">
          {courses.map((course) => {
            const courseLessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
            const doneCount = courseLessonIds.filter((id) => done.has(id)).length;
            const percent = courseLessonIds.length > 0 ? Math.round((doneCount / courseLessonIds.length) * 100) : 0;
            return (
            <Link key={course.id} className="lms-course-card" href={`/learn/${course.slug}`}>
              <div
                className="lms-course-card__accent"
                style={{ background: course.accentColor || "var(--brand)" }}
              />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{course.title}</h2>
              <p className="lesson-text">{course.description || "Описание скоро появится."}</p>
              <div className="dash-progress" aria-hidden>
                <span style={{ width: `${percent}%` }} />
              </div>
              <span className="card-label">{doneCount}/{courseLessonIds.length} уроков · {percent}%</span>
            </Link>
          );
          })}
        </div>
      ) : (
        <section className="explain-card">
          <h2>Пока нет назначенных курсов</h2>
          <p className="lesson-text">
            {user?.company?.verificationStatus === "PENDING_VERIFICATION"
              ? "Дождитесь верификации компании — после этого администратор сможет назначить программы обучения."
              : "Администратор компании назначит курсы в разделе «Курсы». Для демо войдите как владелец компании."}
          </p>
          <Link className="course-button is-primary" href="/dashboard">
            Личный кабинет
          </Link>
        </section>
      )}
    </>
  );
}
