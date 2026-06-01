"use client";

import { useState } from "react";

type Certificate = {
  id: string;
  issuedAt: Date | string | null;
  status: string;
};

export function CertificateBlock({
  canIssue,
  certificate,
  name,
  points
}: {
  canIssue: boolean;
  certificate?: Certificate | null;
  name: string;
  points: number;
}) {
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(certificate);
  const [error, setError] = useState("");

  async function issue() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/certificates", { method: "POST" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Не удалось выдать сертификат.");
      return;
    }
    setIssued(data.certificate);
  }

  if (!issued && !canIssue) return null;

  if (!issued && canIssue) {
    return (
      <article className="lesson-card span-12">
        <span className="card-label">Сертификат</span>
        <h2>Курс пройден!</h2>
        <p className="lesson-text">120 уроков завершены. Можно получить сертификат.</p>
        <button className="course-button is-primary" disabled={loading} onClick={issue} type="button">
          {loading ? "Выдаём..." : "Получить сертификат"}
        </button>
        {error ? <p className="form-message is-error">{error}</p> : null}
      </article>
    );
  }

  if (!issued) return null;

  const date = issued.issuedAt ? new Date(issued.issuedAt).toLocaleDateString("ru-RU") : "";

  return (
    <article className="certificate span-12">
      <div className="certificate__inner">
        <p className="certificate__kicker">Certificate of Completion</p>
        <h2 className="certificate__title">Сертификат</h2>
        <p className="certificate__name">{name}</p>
        <p className="certificate__text">
          Успешно прошёл(ла) курс HTML & CSS: 120 уроков, практика и финальный проект - лендинг-портфолио.
        </p>
        <p className="certificate__date">{date}</p>
        <p className="certificate__pts">{points} очков</p>
      </div>
      <button className="course-button is-primary" onClick={() => window.print()} type="button">
        Сохранить / Печать
      </button>
    </article>
  );
}
