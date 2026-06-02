import Link from "next/link";
import { requireApproved } from "@/lib/session";

export default async function StudioPage() {
  await requireApproved();
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Instructor Studio</span>
        <h1 className="course-title">Студия курсов</h1>
        <p className="course-lead">Визуальный конструктор курсов: блоки, уроки, тесты и публикация.</p>
      </header>
      <section className="lesson-grid">
        <article className="lesson-card span-6">
          <span className="card-label">Конструктор</span>
          <h2>Block canvas</h2>
          <p className="lesson-text">Text, video, PDF, quiz, code, attachments — без программирования.</p>
          <Link className="course-button is-accent" href="/studio/courses">
            Открыть курсы
          </Link>
        </article>
        <article className="explain-card span-6">
          <h2>Публикация</h2>
          <p className="lesson-text">Draft → review → published. Модерация подключается в платформенной зоне.</p>
        </article>
      </section>
    </>
  );
}
