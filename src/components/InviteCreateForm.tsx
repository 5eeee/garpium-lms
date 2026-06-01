"use client";

import { FormEvent, useState } from "react";

export function InviteCreateForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const type = form.get("type") === "MULTI_USE" ? "MULTI_USE" : "SINGLE_USE";
    const maxUsesRaw = String(form.get("maxUses") || "").trim();
    const daysRaw = String(form.get("days") || "").trim();

    const payload: Record<string, unknown> = {
      type,
      assignRole: form.get("assignRole") || "COMPANY_EMPLOYEE",
      jobTitle: String(form.get("jobTitle") || "").trim() || undefined
    };

    if (maxUsesRaw) payload.maxUses = Number(maxUsesRaw);
    if (daysRaw) {
      const expires = new Date();
      expires.setDate(expires.getDate() + Number(daysRaw));
      payload.expiresAt = expires.toISOString();
    }

    const response = await fetch("/api/company/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Не удалось создать приглашение.");
      return;
    }

    setLastCode(data.invitation.displayCode);
    setMessage(`Приглашение создано: ${data.invitation.displayCode}`);
    event.currentTarget.reset();
    window.location.reload();
  }

  return (
    <div>
      <form className="auth-form auth-form--register" onSubmit={onSubmit}>
        <label className="auth-form__full">
          Тип
          <select name="type" defaultValue="SINGLE_USE">
            <option value="SINGLE_USE">Одноразовое</option>
            <option value="MULTI_USE">Многоразовое</option>
          </select>
        </label>
        <label className="auth-form__full">
          Срок действия (дней, необязательно)
          <input name="days" type="number" min={1} max={365} />
        </label>
        <label className="auth-form__full">
          Лимит активаций (необязательно)
          <input name="maxUses" type="number" min={1} max={10000} />
        </label>
        <label className="auth-form__full">
          Должность (необязательно)
          <input name="jobTitle" maxLength={80} />
        </label>
        <label className="auth-form__full">
          Роль при вступлении
          <select name="assignRole" defaultValue="COMPANY_EMPLOYEE">
            <option value="COMPANY_EMPLOYEE">Сотрудник</option>
            <option value="COMPANY_MANAGER">Менеджер</option>
            <option value="COMPANY_ADMIN">Администратор</option>
          </select>
        </label>
        <button className="course-button is-primary" disabled={loading} type="submit">
          {loading ? "Создаём..." : "Создать приглашение"}
        </button>
      </form>
      {lastCode ? (
        <p className="lesson-text">
          Ссылка: <code>/invite/{lastCode.replace(/[^A-Z0-9]/g, "")}</code>
        </p>
      ) : null}
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </div>
  );
}
