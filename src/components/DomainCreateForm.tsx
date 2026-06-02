"use client";

import { FormEvent, useState } from "react";

export function DomainCreateForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/company/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: form.get("domain") })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Не удалось добавить домен.");
      return;
    }
    setMessage(`Домен ${data.domain.domain} добавлен.`);
    event.currentTarget.reset();
    window.location.reload();
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label className="auth-form__full">
        Корпоративный домен
        <input name="domain" required placeholder="company.com" />
      </label>
      <button className="course-button is-accent" type="submit">
        Добавить домен
      </button>
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </form>
  );
}
