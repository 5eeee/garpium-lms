import Link from "next/link";
import type { Lesson, Track } from "@/lib/course-data";

type ModuleGroup = {
  name: string;
  lessons: Lesson[];
};

function groupByModule(lessons: Lesson[]): ModuleGroup[] {
  const groups: ModuleGroup[] = [];
  for (const lesson of lessons) {
    const last = groups[groups.length - 1];
    if (!last || last.name !== lesson.module) {
      groups.push({ name: lesson.module, lessons: [lesson] });
    } else {
      last.lessons.push(lesson);
    }
  }
  return groups;
}

export function Roadmap({
  lessons,
  track,
  doneIds = []
}: {
  lessons: Lesson[];
  track: Track;
  doneIds?: string[];
}) {
  const doneSet = new Set(doneIds);
  const modules = groupByModule(lessons);

  return (
    <section aria-label="Карта курса" className="roadmap-path">
      <div aria-hidden="true" className="roadmap-path__spine" />

      {modules.map((module, moduleIndex) => (
        <div className="roadmap-path__module" key={module.name}>
          <div className="roadmap-path__milestone">
            <span className="roadmap-path__milestone-dot">{moduleIndex + 1}</span>
            <h2 className="roadmap-path__milestone-title">{module.name}</h2>
          </div>

          <ol className="roadmap-path__nodes">
            {module.lessons.map((lesson, index) => {
              const done = doneSet.has(lesson.id);
              const side = index % 2 === 0 ? "left" : "right";

              return (
                <li className={`roadmap-path__node roadmap-path__node--${side}${done ? " is-done" : ""}`} key={lesson.id}>
                  <Link className="roadmap-path__link" href={`/lessons/${lesson.id}`}>
                    <span className="roadmap-path__number">
                      {String(lesson.order).padStart(2, "0")}
                      {done ? " ✓" : ""}
                    </span>
                    <div className="roadmap-path__card">
                      <strong>{lesson.title}</strong>
                      <p>{lesson.simple}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}

      <div className="roadmap-path__finish">
        <span className="roadmap-path__finish-dot" aria-hidden="true" />
        <p>Сертификат после 120 уроков · {track.toUpperCase()}</p>
      </div>
    </section>
  );
}
