"use client";

import { FormEvent, useState } from "react";

export function DepartmentCreateForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/company/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        type: form.get("type") || "DEPARTMENT"
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Не удалось создать отдел.");
      return;
    }

    setMessage(`Отдел «${data.department.name}» создан.`);
    event.currentTarget.reset();
    window.location.reload();
  }

  return (
    <div>
      <form className="auth-form auth-form--register" onSubmit={onSubmit}>
        <label className="auth-form__full">
          Название
          <input name="name" maxLength={80} required placeholder="Отдел продаж" />
        </label>
        <label className="auth-form__full">
          Тип
          <select name="type" defaultValue="DEPARTMENT">
            <option value="DEPARTMENT">Отдел</option>
            <option value="DIVISION">Подразделение</option>
            <option value="GROUP">Группа</option>
            <option value="TEAM">Команда</option>
            <option value="BRANCH">Филиал</option>
          </select>
        </label>
        <button className="course-button is-primary" disabled={loading} type="submit">
          {loading ? "Создаём..." : "Добавить"}
        </button>
      </form>
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </div>
  );
}
