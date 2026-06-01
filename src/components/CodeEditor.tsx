"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "@/lib/course-data";
import { checkCode, formatCode } from "@/lib/code-checker/checker";

function sanitizePreview(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
}

export function CodeEditor({ lesson }: { lesson: Lesson }) {
  const [code, setCode] = useState(lesson.task.starter);
  const [saved, setSaved] = useState("");
  const [checking, setChecking] = useState(false);
  const result = useMemo(
    () =>
      checkCode(code, {
        type: lesson.task.type,
        primary: lesson.task.primary,
        acceptable: lesson.task.acceptable,
        wrongHints: lesson.task.wrongHints
      }),
    [code, lesson]
  );

  async function submit() {
    setChecking(true);
    setSaved("");
    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: lesson.id,
        code,
        result
      })
    });
    const data = await response.json();
    setChecking(false);
    if (data.saved && data.ok) {
      setSaved("Задание принято! Прогресс сохранён.");
    } else if (data.saved) {
      setSaved("Попытка сохранена. Исправьте код по подсказкам.");
    } else {
      setSaved(data.message || "Попытка проверена локально.");
    }
  }

  return (
    <div className="code-playground">
      <div className="code-playground__head">
        <div>
          <p className="card-label">Практика</p>
          <h2>{lesson.task.label}</h2>
        </div>
        <span className="code-playground__type">{lesson.task.type.toUpperCase()}</span>
      </div>

      <div className="code-playground__toolbar">
        <button onClick={() => setCode(formatCode(code, lesson.task.type))} type="button">
          Выровнять
        </button>
        <button onClick={() => setCode(lesson.task.starter)} type="button">
          Сбросить
        </button>
        <button onClick={() => setCode(lesson.task.primary[0] || lesson.task.starter)} type="button">
          Подсказка
        </button>
      </div>

      <textarea
        className="code-playground__input"
        maxLength={700}
        onChange={(event) => setCode(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submit();
          if (event.key === "Tab") {
            event.preventDefault();
            const target = event.currentTarget;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const next = code.slice(0, start) + "  " + code.slice(end);
            setCode(next);
            requestAnimationFrame(() => {
              target.selectionStart = target.selectionEnd = start + 2;
            });
          }
        }}
        value={code}
      />

      <div className="playground-stage">
        <div dangerouslySetInnerHTML={{ __html: sanitizePreview(lesson.task.preview) }} />
      </div>

      <div className="code-playground__actions">
        <p className={`code-playground__msg is-${result.tier.toLowerCase()}`}>{result.message}</p>
        <button className="course-button is-primary" disabled={checking} onClick={submit} type="button">
          {checking ? "Проверяем..." : "Проверить"}
        </button>
      </div>

      {saved ? <p className="form-message">{saved}</p> : null}

      <ul className="diagnostic-list">
        {result.diagnostics.map((item, index) => (
          <li className={`is-${item.level}`} key={`${item.title}-${index}`}>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
