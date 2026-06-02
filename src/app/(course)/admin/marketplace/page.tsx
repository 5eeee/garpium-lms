import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/session";

export default async function AdminMarketplacePage() {
  await requireSuperAdmin();
  const courses = await db.course.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Platform</span>
        <h1 className="course-title">Модерация маркетплейса</h1>
        <p className="course-lead">Проверка курсов авторов перед публикацией и настройка комиссии платформы.</p>
      </header>
      <section className="lesson-card">
        {courses.map((course) => (
          <div className="admin-row" key={course.id}>
            <span>
              {course.title}
              <small>{course.slug} · draft/review/published будет добавлен в модели Studio</small>
            </span>
            <button className="course-button" type="button">Проверить</button>
          </div>
        ))}
      </section>
    </>
  );
}
