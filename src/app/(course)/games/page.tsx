import Link from "next/link";
import { requireApproved } from "@/lib/session";

export default async function GamesHubPage() {
  await requireApproved();
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Games</span>
        <h1 className="course-title">Игры по CSS</h1>
        <p className="course-lead">Практикуй селекторы, Flexbox и Grid в интерактивном формате.</p>
      </header>
      <section className="lesson-grid">
        <Link className="lesson-card span-6" href="/games/selectors">
          <span className="card-label">Quiz</span>
          <h2>Селекторы</h2>
          <p className="lesson-text">6 вопросов без кода</p>
        </Link>
        <Link className="lesson-card span-6" href="/games/flex">
          <span className="card-label">Flex</span>
          <h2>Flex Лягушата</h2>
          <p className="lesson-text">8 уровней flexbox</p>
        </Link>
        <Link className="lesson-card span-6" href="/games/grid">
          <span className="card-label">Grid</span>
          <h2>Grid Сад</h2>
          <p className="lesson-text">6 уровней grid</p>
        </Link>
      </section>
    </>
  );
}
