"use client";

import { FormEvent, useState } from "react";
import { IconCheck } from "@/components/ui/LmsIcon";
import { GosuslugiLogo } from "@/components/ui/GosuslugiLogo";
import { ProfileNameEditor } from "@/components/dashboard/ProfileNameEditor";

export type PersonalUser = {
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
  phone: string | null;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  esiaVerifiedAt: string | null;
  hasPassword: boolean;
};

type Step = "idle" | "password" | "input" | "code";

function VerifiedMark() {
  return (
    <span className="pdata-ok" title="Подтверждено">
      <IconCheck size={14} />
    </span>
  );
}

function Row({
  label,
  value,
  verified,
  actionLabel,
  onAction
}: {
  label: string;
  value: React.ReactNode;
  verified?: boolean;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="pdata-row">
      <span className="pdata-row__label">{label}</span>
      <div className="pdata-row__value">
        {value}
        {verified ? <VerifiedMark /> : null}
      </div>
      <button className="course-button pdata-row__btn" type="button" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}

export function PersonalDataTab({ user, embedded = false }: { user: PersonalUser; embedded?: boolean }) {
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [emailVerified, setEmailVerified] = useState(!!user.emailVerifiedAt);
  const [phoneVerified, setPhoneVerified] = useState(!!user.phoneVerifiedAt);

  const [field, setField] = useState<"email" | "phone" | "password" | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwdChannel, setPwdChannel] = useState<"email" | "phone">("email");

  function resetFlow() {
    setField(null);
    setStep("idle");
    setInput("");
    setCode("");
    setPassword("");
    setErr("");
    setMsg("");
  }

  async function verifyPasswordThen(next: Step) {
    setLoading(true);
    setErr("");
    const res = await fetch("/api/profile/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Неверный пароль.");
      return;
    }
    setPassword("");
    setStep(next);
    setMsg("");
  }

  function startEmail() {
    resetFlow();
    setField("email");
    if (emailVerified) {
      setStep("password");
    } else {
      setStep("input");
      setInput(email);
    }
  }

  function startPhone() {
    resetFlow();
    setField("phone");
    if (phoneVerified) {
      setStep("password");
    } else {
      setStep("input");
      setInput(phone);
    }
  }

  function startPassword() {
    resetFlow();
    setField("password");
    setStep("input");
  }

  async function sendEmail(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/profile/email/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(!emailVerified && input === email ? { useCurrent: true } : { email: input })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Ошибка.");
      return;
    }
    setStep("code");
    setMsg("Письмо отправлено. Введите код из email.");
  }

  async function confirmEmail(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/profile/email/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Неверный код.");
      return;
    }
    setEmail(data.email);
    setEmailVerified(true);
    setMsg("Email подтверждён.");
    resetFlow();
    if (data.reload) window.location.reload();
  }

  async function sendPhone(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/profile/phone/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: input })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Ошибка.");
      return;
    }
    setStep("code");
    setMsg("SMS отправлено.");
  }

  async function confirmPhone(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/profile/phone/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Неверный код.");
      return;
    }
    setPhone(data.phone);
    setPhoneVerified(true);
    setMsg("Номер подтверждён.");
    resetFlow();
  }

  async function sendPasswordReset() {
    setLoading(true);
    setErr("");
    const res = await fetch("/api/profile/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: pwdChannel })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Ошибка.");
      return;
    }
    setStep("code");
    setMsg(pwdChannel === "phone" ? "Код отправлен по SMS." : "Код отправлен на email.");
  }

  async function confirmPasswordReset(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/profile/password/reset", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Неверный код.");
      return;
    }
    window.location.href = data.redirect || "/change-password";
  }

  return (
    <div className={embedded ? "pdata-embedded" : "account-panel"}>
      <div className="pdata-panel">
        <ProfileNameEditor
          firstName={user.firstName}
          lastName={user.lastName}
          middleName={user.middleName}
        />

        <Row
          actionLabel={emailVerified ? "Сменить" : email ? "Подтвердить" : "Привязать"}
          label="Email"
          verified={emailVerified}
          value={emailVerified || email ? email : "—"}
          onAction={startEmail}
        />

        <Row
          actionLabel={phoneVerified ? "Сменить" : "Привязать"}
          label="Номер телефона"
          verified={phoneVerified}
          value={phoneVerified && phone ? phone : phone || "—"}
          onAction={startPhone}
        />

        <Row actionLabel="Сменить" label="Пароль" value="••••••••" onAction={startPassword} />

        <div className="pdata-row">
          <span className="pdata-row__label pdata-row__label--brand">
            <GosuslugiLogo size={22} />
            Госуслуги
          </span>
          <div className="pdata-row__value">
            {user.esiaVerifiedAt ? "Личность подтверждена" : "Не пройдена"}
            {user.esiaVerifiedAt ? <VerifiedMark /> : null}
          </div>
          <a className="course-button pdata-row__btn" href="/api/auth/esia/start?scope=user">
            {user.esiaVerifiedAt ? "Повторить" : "Проверить"}
          </a>
        </div>
      </div>

      {field && step !== "idle" ? (
        <div className="pdata-flow lms-card">
          <button className="pdata-flow__close" type="button" onClick={resetFlow}>
            ×
          </button>

          {step === "password" ? (
            <form
              className="pdata-flow__form"
              onSubmit={(e) => {
                e.preventDefault();
                verifyPasswordThen("input");
              }}
            >
              <p>Введите пароль для смены</p>
              <input
                autoFocus
                placeholder="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="course-button is-accent" disabled={loading} type="submit">
                Продолжить
              </button>
            </form>
          ) : null}

          {field === "email" && step === "input" ? (
            <form className="pdata-flow__form" onSubmit={sendEmail}>
              <input
                autoFocus
                placeholder="Email"
                type="email"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="course-button is-accent" disabled={loading} type="submit">
                Получить письмо
              </button>
            </form>
          ) : null}

          {field === "email" && step === "code" ? (
            <form className="pdata-flow__form" onSubmit={confirmEmail}>
              <input
                autoFocus
                inputMode="numeric"
                maxLength={6}
                placeholder="Код из письма"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="course-button is-accent" disabled={loading} type="submit">
                Подтвердить
              </button>
            </form>
          ) : null}

          {field === "phone" && step === "input" ? (
            <form className="pdata-flow__form" onSubmit={sendPhone}>
              <input
                autoFocus
                placeholder="+7 900 000-00-00"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="course-button is-accent" disabled={loading} type="submit">
                Получить SMS
              </button>
            </form>
          ) : null}

          {field === "phone" && step === "code" ? (
            <form className="pdata-flow__form" onSubmit={confirmPhone}>
              <input
                autoFocus
                inputMode="numeric"
                maxLength={6}
                placeholder="Код из SMS"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="course-button is-accent" disabled={loading} type="submit">
                Подтвердить
              </button>
            </form>
          ) : null}

          {field === "password" && step === "input" ? (
            <div className="pdata-flow__form">
              <p>Отправить код для смены пароля</p>
              <div className="pdata-flow__channels">
                <button
                  className={`course-button${pwdChannel === "email" ? " is-accent" : ""}`}
                  type="button"
                  onClick={() => setPwdChannel("email")}
                >
                  На email
                </button>
                <button
                  className={`course-button${pwdChannel === "phone" ? " is-accent" : ""}`}
                  disabled={!phoneVerified}
                  type="button"
                  onClick={() => setPwdChannel("phone")}
                >
                  По SMS
                </button>
              </div>
              <button className="course-button is-accent" disabled={loading} type="button" onClick={sendPasswordReset}>
                Отправить код
              </button>
            </div>
          ) : null}

          {field === "password" && step === "code" ? (
            <form className="pdata-flow__form" onSubmit={confirmPasswordReset}>
              <input
                autoFocus
                inputMode="numeric"
                maxLength={6}
                placeholder="Код"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="course-button is-accent" disabled={loading} type="submit">
                Перейти к смене пароля
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {msg ? <p className="pdata-msg is-ok">{msg}</p> : null}
      {err ? <p className="pdata-msg is-error">{err}</p> : null}
    </div>
  );
}
