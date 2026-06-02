"use client";

import { FormEvent, useMemo, useState } from "react";

type Diagnostic = {
  level: "success" | "info" | "warn" | "error";
  title: string;
  text: string;
};

type TaskPracticeProps = {
  task: {
    id: string;
    label: string;
    starter: string;
    preview: string;
    maxLength: number;
  };
};

export function TaskPractice({ task }: TaskPracticeProps) {
  const [code, setCode] = useState(task.starter || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [ok, setOk] = useState(false);

  const remaining = useMemo(() => Math.max(0, task.maxLength - code.length), [code.length, task.maxLength]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, code })
    });
    const data = await response.json();
    setLoading(false);
    setOk(Boolean(data.result?.ok));
    setMessage(data.result?.message || data.error || "Проверка завершена.");
    setDiagnostics(data.result?.diagnostics || []);
  }

  return (
    <form className="practice-card" onSubmit={submit}>
      <div className="practice-card__head">
        <span className="card-label">Практика</span>
        <strong>{task.label}</strong>
      </div>
      {task.preview ? <p className="lesson-text">{task.preview}</p> : null}
      <textarea
        className="practice-card__editor"
        maxLength={task.maxLength}
        spellCheck={false}
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <div className="practice-card__footer">
        <span>{remaining} символов осталось</span>
        <button className="course-button is-accent" disabled={loading} type="submit">
          {loading ? "Проверяем..." : ok ? "Проверить ещё раз" : "Проверить"}
        </button>
      </div>
      {message ? <p className={`practice-card__message${ok ? " is-ok" : ""}`}>{message}</p> : null}
      {diagnostics.length > 0 ? (
        <ul className="practice-card__diagnostics">
          {diagnostics.map((item, index) => (
            <li key={`${item.title}-${index}`} className={`is-${item.level}`}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
