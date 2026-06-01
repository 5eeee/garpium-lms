"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function InviteAcceptForm({ code }: { code: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/organizations/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Не удалось отправить заявку.");
      return;
    }

    setMessage(data.message || "Заявка отправлена.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <button className="course-button is-primary" disabled={loading} type="submit">
        {loading ? "Отправляем..." : "Подать заявку на вступление"}
      </button>
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </form>
  );
}

export function InviteGuestActions({ code }: { code: string }) {
  return (
    <div className="course-footer" style={{ padding: 0, marginTop: "1rem" }}>
      <Link className="course-button is-primary" href={`/login?mode=register&invite=${code}`}>
        Зарегистрироваться
      </Link>
      <Link className="course-button" href={`/login?invite=${code}`}>
        Войти
      </Link>
    </div>
  );
}
