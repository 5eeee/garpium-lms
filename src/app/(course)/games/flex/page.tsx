import Link from "next/link";
import { FlexGame } from "@/components/games/FlexGame";
import { requireApproved } from "@/lib/session";

export default async function FlexGamePage() {
  await requireApproved();
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">28 / Игра</span>
        <h1 className="course-title">Flex Лягушата</h1>
        <p className="course-lead">
          Интерфейс как Flexbox Froggy: слева задание и редактор CSS, справа пруд с лягушатами.
        </p>
      </header>
      <section className="lesson-grid">
        <FlexGame />
      </section>
      <footer className="course-footer">
        <Link className="course-button" href="/lessons/c-27">← Flex урок</Link>
        <Link className="course-button is-primary" href="/games/grid">Grid →</Link>
      </footer>
    </>
  );
}
