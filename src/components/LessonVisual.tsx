import type { Lesson } from "@/lib/course-data";

export function LessonVisual({ lesson }: { lesson: Lesson }) {
  if (lesson.visual === "flow") {
    return (
      <div className="visual-flow">
        <div>Теория</div>
        <span />
        <div>Пример</div>
        <span />
        <div>Практика</div>
      </div>
    );
  }

  if (lesson.visual === "box") {
    return (
      <div className="visual-boxmodel">
        <div className="box-layer margin">margin</div>
        <div className="box-layer border">border</div>
        <div className="box-layer padding">padding</div>
        <div className="box-layer content">content</div>
      </div>
    );
  }

  if (lesson.visual === "game") {
    return (
      <div className="visual-game">
        <div className="game-tile active">1</div>
        <div className="game-tile">2</div>
        <div className="game-tile">3</div>
        <div className="game-target">target</div>
      </div>
    );
  }

  return (
    <div className="visual-structure">
      <header>header</header>
      <main>
        <section>{lesson.title}</section>
        <aside>hint</aside>
      </main>
      <footer>footer</footer>
    </div>
  );
}
