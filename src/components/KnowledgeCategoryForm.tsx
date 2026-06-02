"use client";

import { FormEvent, useState } from "react";

export function KnowledgeCategoryForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/company/knowledge/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name") })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Не удалось создать категорию.");
      return;
    }

    setMessage(`Категория «${data.category.name}» создана.`);
    event.currentTarget.reset();
    window.location.reload();
  }

  return (
    <div>
      <form className="auth-form auth-form--register" onSubmit={onSubmit}>
        <label className="auth-form__full">
          Название категории
          <input name="name" maxLength={80} required placeholder="Инструкции" />
        </label>
        <button className="course-button is-primary" disabled={loading} type="submit">
          {loading ? "Создаём..." : "Добавить категорию"}
        </button>
      </form>
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </div>
  );
}
