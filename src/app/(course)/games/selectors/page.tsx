import Link from "next/link";
import { SelectorGame } from "@/components/games/SelectorGame";
import { requireApproved } from "@/lib/session";

export default async function SelectorGamePage() {
  await requireApproved();
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Игра</span>
        <h1 className="course-title">Селекторы</h1>
        <p className="course-lead">6 вопросов: тег, class, id, комбинаторы. Выбери правильный вариант.</p>
      </header>
      <section className="lesson-grid">
        <SelectorGame />
      </section>
      <footer className="course-footer">
        <Link className="course-button" href="/lessons/c-04">← Урок селекторы</Link>
        <Link className="course-button is-primary" href="/games/flex">Flex игра →</Link>
      </footer>
    </>
  );
}
