"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { IconShield } from "@/components/ui/LmsIcon";
import { verificationLabel } from "@/lib/roles";
import {
  LEGAL_FORM_KEYS,
  ORGANIZATION_LEGAL_FORMS,
  type LegalFormKey
} from "@/lib/organization-legal-forms";

type CompanyInfo = {
  id: string;
  name: string;
  slug: string;
  verificationStatus: string;
  legalForm?: string | null;
  esiaVerifiedAt?: string | null;
  inn?: string | null;
};

type JoinRequestInfo = {
  id: string;
  status: string;
  company: { name: string };
};

const PRIVATE_KEY = "garpium-private-mode";

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
  const [legalForm, setLegalForm] = useState<LegalFormKey>("OOO");
  const [privateMode, setPrivateMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formConfig = ORGANIZATION_LEGAL_FORMS[legalForm];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPrivateMode(localStorage.getItem(PRIVATE_KEY) === "1");
    }
  }, []);

  function choosePrivate() {
    localStorage.setItem(PRIVATE_KEY, "1");
    setPrivateMode(true);
    setMessage("Вы используете платформу как частное лицо. Раздел «Моя компания» доступен в любой момент.");
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/organizations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, legalForm })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Не удалось отправить заявку.");
      return;
    }
    localStorage.removeItem(PRIVATE_KEY);
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
    localStorage.removeItem(PRIVATE_KEY);
    setMessage(data.message || "Заявка отправлена.");
    window.location.reload();
  }

  if (company) {
    const legalLabel = company.legalForm
      ? ORGANIZATION_LEGAL_FORMS[company.legalForm as LegalFormKey]?.label
      : null;

    return (
      <article className="dash-card dash-card--wide">
        <span className="dash-card__label">Моя компания</span>
        <h2>{company.name}</h2>
        <div className="dash-company-meta">
          {legalLabel ? <span className="dash-company-tag">{legalLabel}</span> : null}
          <span className="dash-company-tag">{verificationLabel(company.verificationStatus)}</span>
          {company.inn ? <span className="dash-company-tag">ИНН {company.inn}</span> : null}
        </div>

        {company.verificationStatus !== "VERIFIED" ? (
          <div className="dash-company-verify surface-muted">
            <p>
              Для открытия корпоративных функций пройдите проверку. Рекомендуем официальное подтверждение через
              Госуслуги.
            </p>
            <a className="course-button is-accent" href="/api/auth/esia/start?scope=company">
              <IconShield size={16} />
              {company.esiaVerifiedAt ? "Повторить через Госуслуги" : "Подтвердить через Госуслуги"}
            </a>
            {company.esiaVerifiedAt ? (
              <p className="lesson-text is-ok">Госуслуги: данные получены, ожидается финальная проверка.</p>
            ) : null}
          </div>
        ) : null}

        {company.verificationStatus === "VERIFIED" ? (
          <Link className="course-button is-accent" href="/company">
            Корпоративный кабинет →
          </Link>
        ) : (
          <p className="lesson-text">Корпоративные функции откроются после проверки заявки.</p>
        )}
      </article>
    );
  }

  if (pendingJoin) {
    return (
      <article className="dash-card dash-card--wide">
        <span className="dash-card__label">Моя компания</span>
        <h2>Заявка в «{pendingJoin.company.name}»</h2>
        <p className="lesson-text">
          Статус: <strong>{pendingJoin.status}</strong>. Администратор организации подтвердит вступление.
        </p>
      </article>
    );
  }

  if (privateMode && mode === "idle") {
    return (
      <article className="dash-card dash-card--wide dash-company-empty" id="company">
        <span className="dash-card__label">Моя компания</span>
        <h2>Частное использование</h2>
        <p>Вы обучаетесь как физическое лицо. Когда будете готовы — подключите организацию.</p>
        <div className="dash-company-empty__actions">
          <button className="course-button is-accent" onClick={() => setPrivateMode(false)} type="button">
            Создать компанию
          </button>
          <button className="course-button" onClick={() => { setPrivateMode(false); setMode("join"); }} type="button">
            Присоединиться
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="dash-card dash-card--wide dash-company-empty" id="company">
      <span className="dash-card__label">Моя компания</span>
      <h2>Подключите организацию</h2>
      <p>
        Создайте компанию для корпоративного обучения, присоединитесь по приглашению или продолжайте как частное лицо.
      </p>

      {mode === "idle" ? (
        <div className="dash-company-empty__actions">
          <button className="course-button is-accent" onClick={() => setMode("create")} type="button">
            Создать компанию
          </button>
          <button className="course-button" onClick={() => setMode("join")} type="button">
            Присоединиться к компании
          </button>
          <button className="course-button" onClick={choosePrivate} type="button">
            Продолжить как частное лицо
          </button>
        </div>
      ) : null}

      {mode === "create" ? (
        <form className="auth-form auth-form--register dash-company-form" onSubmit={onCreate}>
          <fieldset className="dash-company-form__types">
            <legend>Организационно-правовая форма</legend>
            <div className="dash-company-types">
              {LEGAL_FORM_KEYS.map((key) => (
                <button
                  key={key}
                  className={`dash-company-type${legalForm === key ? " is-active" : ""}`}
                  type="button"
                  onClick={() => setLegalForm(key)}
                >
                  <strong>{ORGANIZATION_LEGAL_FORMS[key].label}</strong>
                  <small>{ORGANIZATION_LEGAL_FORMS[key].description}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <p className="dash-company-esia-hint">
            <IconShield size={16} />
            {formConfig.esiaHint}
          </p>

          <label className="auth-form__full">
            Название компании
            <input name="name" maxLength={80} required />
          </label>
          <label className="auth-form__full">
            ИНН
            <input
              name="inn"
              inputMode="numeric"
              maxLength={12}
              minLength={10}
              required
              placeholder={formConfig.innHint}
            />
          </label>
          {formConfig.needsOgrn ? (
            <label className="auth-form__full">
              {formConfig.ogrnLabel}
              <input name="ogrn" inputMode="numeric" maxLength={15} required placeholder="13–15 цифр" />
            </label>
          ) : null}
          {formConfig.needsKpp ? (
            <label className="auth-form__full">
              КПП
              <input name="kpp" inputMode="numeric" maxLength={9} minLength={9} required placeholder="9 цифр" />
            </label>
          ) : null}
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
            <button className="course-button is-accent" disabled={loading} type="submit">
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
            <button className="course-button is-accent" disabled={loading} type="submit">
              {loading ? "Отправляем..." : "Отправить заявку"}
            </button>
            <button className="course-button" onClick={() => setMode("idle")} type="button">
              Отмена
            </button>
          </div>
        </form>
      ) : null}

      {pendingVerification ? <p className="lesson-text">Заявка на создание компании уже на проверке.</p> : null}
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </article>
  );
}
