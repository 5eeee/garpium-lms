"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { verificationLabel } from "@/lib/roles";

type CompanyInfo = {
  id: string;
  name: string;
  slug: string;
  verificationStatus: string;
};

type JoinRequestInfo = {
  id: string;
  status: string;
  company: { name: string };
};

export function MyCompanySection({
  company,
  pendingJoin,
  pendingVerification
}: {
  company: CompanyInfo | null;
  pendingJoin: JoinRequestInfo | null;
  pendingVerification: boolean;
}) {
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/organizations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Не удалось отправить заявку.");
      return;
    }
    setMessage(data.message || "Заявка отправлена.");
    window.location.reload();
  }

  async function onJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/organizations/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: form.get("code") })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Не удалось принять приглашение.");
      return;
    }
    setMessage(data.message || "Заявка отправлена.");
    window.location.reload();
  }

  if (company) {
    return (
      <article className="lesson-card span-12">
        <span className="card-label">Моя компания</span>
        <h2>{company.name}</h2>
        <p className="lesson-text">
          Статус: <strong>{verificationLabel(company.verificationStatus)}</strong>
        </p>
        {company.verificationStatus === "VERIFIED" ? (
          <Link className="course-button is-primary" href="/company">
            Корпоративный кабинет
          </Link>
        ) : (
          <p className="lesson-text">
            Корпоративные функции откроются после проверки заявки командой Garpium.
          </p>
        )}
      </article>
    );
  }

  if (pendingJoin) {
    return (
      <article className="explain-card span-12">
        <span className="card-label">Моя компания</span>
        <h2>Заявка в «{pendingJoin.company.name}»</h2>
        <p className="lesson-text">
          Статус: <strong>{pendingJoin.status}</strong>. Администратор организации подтвердит вступление.
        </p>
      </article>
    );
  }

  return (
    <article className="lesson-card span-12">
      <span className="card-label">Моя компания</span>
      <h2>Организация не подключена</h2>
      <p className="lesson-text">
        Создайте компанию для корпоративного обучения или присоединитесь по приглашению от администратора.
      </p>

      {mode === "idle" ? (
        <div className="course-footer" style={{ marginTop: "1rem", padding: 0 }}>
          <button className="course-button is-primary" onClick={() => setMode("create")} type="button">
            Создать компанию
          </button>
          <button className="course-button" onClick={() => setMode("join")} type="button">
            Присоединиться
          </button>
        </div>
      ) : null}

      {mode === "create" ? (
        <form className="auth-form auth-form--register" onSubmit={onCreate} style={{ marginTop: "1rem" }}>
          <label className="auth-form__full">
            Название компании
            <input name="name" maxLength={80} required />
          </label>
          <label className="auth-form__full">
            ИНН
            <input name="inn" inputMode="numeric" maxLength={12} required placeholder="7701234567" />
          </label>
          <label className="auth-form__full">
            Юридическое название
            <input name="legalName" maxLength={200} required />
          </label>
          <label className="auth-form__full">
            Юридический адрес
            <input name="legalAddress" maxLength={300} required />
          </label>
          <label className="auth-form__full">
            Корпоративный email
            <input name="corporateEmail" type="email" maxLength={80} required />
          </label>
          <label className="auth-form__full">
            Дополнительная информация
            <textarea name="additionalInfo" maxLength={2000} rows={3} />
          </label>
          <label className="auth-form__full">
            Код организации (необязательно)
            <input name="slug" maxLength={40} placeholder="acme" />
          </label>
          <div className="course-footer" style={{ padding: 0 }}>
            <button className="course-button is-primary" disabled={loading} type="submit">
              {loading ? "Отправляем..." : "Отправить на проверку"}
            </button>
            <button className="course-button" onClick={() => setMode("idle")} type="button">
              Отмена
            </button>
          </div>
        </form>
      ) : null}

      {mode === "join" ? (
        <form className="auth-form" onSubmit={onJoin} style={{ marginTop: "1rem" }}>
          <label className="auth-form__full">
            Код приглашения
            <input name="code" maxLength={40} placeholder="GARP-8H2K-9X5P-Q7L1" required />
          </label>
          <p className="auth-field-note auth-form__full">
            Или перейдите по ссылке вида <code>/invite/8H2K9X5PQ7L1</code>
          </p>
          <div className="course-footer" style={{ padding: 0 }}>
            <button className="course-button is-primary" disabled={loading} type="submit">
              {loading ? "Отправляем..." : "Отправить заявку"}
            </button>
            <button className="course-button" onClick={() => setMode("idle")} type="button">
              Отмена
            </button>
          </div>
        </form>
      ) : null}

      {pendingVerification ? (
        <p className="lesson-text">Заявка на создание компании уже на проверке.</p>
      ) : null}
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </article>
  );
}
