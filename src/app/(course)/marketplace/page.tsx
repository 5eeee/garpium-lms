import Link from "next/link";
import { db } from "@/lib/db";

export default async function MarketplacePage() {
  const courses = await db.course.findMany({ orderBy: { order: "asc" }, take: 12 });
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Marketplace</span>
        <h1 className="course-title">Маркетплейс курсов</h1>
        <p className="course-lead">Публичный каталог программ от Garpium и авторов. Продажи подключаются поэтапно.</p>
      </header>
      <section className="lms-course-grid">
        {courses.map((course) => (
          <Link className="lms-course-card" href={`/learn/${course.slug}`} key={course.id}>
            <div className="lms-course-card__accent" style={{ background: course.accentColor }} />
            <h2>{course.title}</h2>
            <p className="lesson-text">{course.description}</p>
            <span className="card-label">Бесплатно для назначенных пользователей</span>
          </Link>
        ))}
      </section>
    </>
  );
}
