import Link from "next/link";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const session = await requireSession();

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Ожидание</span>
        <h1 className="course-title">Доступ ожидает одобрения</h1>
        <p className="course-lead">
          {session.user.name}, администратор компании проверит регистрацию и откроет обучение.
          После одобрения появятся уроки, рейтинг, чат и сертификат.
        </p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-12">
          <span className="card-label">Статус</span>
          <h2>PENDING</h2>
          <p className="lesson-text">Заявка принята. Обычно проверка занимает до одного рабочего дня.</p>
          <Link className="course-button is-primary" href="/dashboard">
            Проверить статус
          </Link>
        </article>
      </section>
    </>
  );
}
