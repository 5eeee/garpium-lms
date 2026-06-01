"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SupportPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const data = await response.json();
    setMessage(data.error || "Сообщение отправлено. Поддержка увидит его в админке.");
    setLoading(false);
  }

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Support</span>
        <h1 className="course-title">Чат поддержки</h1>
        <p className="course-lead">Задайте вопрос по доступу, уроку, игре или сертификату.</p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-12">
          <span className="card-label">Сообщение</span>
          <h2>Напишите нам</h2>
          <form className="support-form profile-form" onSubmit={onSubmit}>
            <label>
              Тема
              <input name="subject" maxLength={120} required />
            </label>
            <label>
              Сообщение
              <textarea name="body" maxLength={1000} required />
            </label>
            <button className="course-button is-primary" disabled={loading} type="submit">
              {loading ? "Отправляем..." : "Отправить"}
            </button>
          </form>
          {message ? <p className="form-message">{message}</p> : null}
        </article>
      </section>
    </>
  );
}
