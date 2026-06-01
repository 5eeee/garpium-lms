import Link from "next/link";
import { GridGame } from "@/components/games/GridGame";
import { requireApproved } from "@/lib/session";

export default async function GridGamePage() {
  await requireApproved();
  return (
    <>
      <header className="course-top">
        <span className="course-kicker">31 / Игра</span>
        <h1 className="course-title">Grid Сад</h1>
        <p className="course-lead">Как Grid Garden: поле с сеткой, растение нужно «полить».</p>
      </header>
      <section className="lesson-grid">
        <GridGame />
      </section>
      <footer className="course-footer">
        <Link className="course-button" href="/lessons/c-30">← Grid урок</Link>
        <Link className="course-button is-primary" href="/lessons/c-32">Адаптив →</Link>
      </footer>
    </>
  );
}
