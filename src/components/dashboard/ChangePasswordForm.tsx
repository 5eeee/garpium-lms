"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ChangePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/profile/password/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirm })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Ошибка.");
      return;
    }
    router.push("/dashboard#settings");
    router.refresh();
  }

  return (
    <div className="account">
      <section className="lms-frame" style={{ padding: "24px", maxWidth: 420 }}>
        <h1 style={{ margin: "0 0 16px", fontFamily: "Montserrat Alternates, Inter, sans-serif" }}>
          Новый пароль
        </h1>
        <form className="pdata-flow__form" onSubmit={onSubmit}>
          <input
            autoFocus
            minLength={8}
            placeholder="Новый пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            minLength={8}
            placeholder="Повторите пароль"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {err ? <p className="pdata-msg is-error">{err}</p> : null}
          <button className="course-button is-primary" disabled={loading} type="submit">
            Сохранить пароль
          </button>
        </form>
        <Link className="course-button" href="/dashboard#settings" style={{ marginTop: 12 }}>
          Назад
        </Link>
      </section>
    </div>
  );
}
