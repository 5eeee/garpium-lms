import type { LessonSection } from "@/lib/course-data";

export function LessonSections({ sections }: { sections: LessonSection[] }) {
  if (!sections.length) return null;

  return (
    <div className="lesson-sections">
      {sections.map((section, index) => {
        if (section.type === "text") {
          return (
            <article className="lesson-card span-12" key={`${section.title}-${index}`}>
              {section.title ? <h3>{section.title}</h3> : null}
              <p className="lesson-text">{section.body}</p>
            </article>
          );
        }
        if (section.type === "code") {
          return (
            <article className="lesson-card span-12" key={`${section.label}-${index}`}>
              {section.label ? <span className="card-label">{section.label}</span> : null}
              <pre className="code-playground__input">{section.code}</pre>
            </article>
          );
        }
        if (section.type === "compare") {
          return (
            <article className="explain-card span-12" key={`compare-${index}`}>
              <h3>Сравнение</h3>
              <p className="lesson-text">
                <strong>Плохо:</strong> {section.bad}
              </p>
              <p className="lesson-text">
                <strong>Хорошо:</strong> {section.good}
              </p>
            </article>
          );
        }
        return null;
      })}
    </div>
  );
}
