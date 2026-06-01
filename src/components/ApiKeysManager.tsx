"use client";

import { FormEvent, useEffect, useState } from "react";

type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  active: boolean;
  company: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/api-keys");
    const data = await response.json();
    setKeys(data.keys || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createKey(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setSecret("");
    const response = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Ошибка");
      return;
    }
    setSecret(data.secret);
    setMessage(data.message);
    setName("");
    load();
  }

  async function revoke(id: string) {
    await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="lesson-grid">
      <article className="lesson-card span-12">
        <span className="card-label">Partner API</span>
        <h2>Ключи доступа GARPIUM LMS</h2>
        <p className="lesson-text">
          Другие компании подключают обучение через REST API. Заголовок:{" "}
          <code>Authorization: Bearer garp_...</code>
        </p>

        <form className="profile-form" onSubmit={createKey}>
          <label>
            Название ключа (компания-партнёр)
            <input onChange={(e) => setName(e.target.value)} required value={name} />
          </label>
          <button className="course-button is-primary" disabled={loading} type="submit">
            {loading ? "Создаём..." : "Создать API-ключ"}
          </button>
        </form>

        {secret ? (
          <p className="form-message">
            <strong>Новый ключ (скопируйте сейчас):</strong>
            <br />
            <code>{secret}</code>
          </p>
        ) : null}
        {message && !secret ? <p className="form-message">{message}</p> : null}
      </article>

      <article className="lesson-card span-12">
        <h3>Эндпоинты</h3>
        <ul className="lesson-text">
          <li><code>GET /api/v1/courses</code> - курсы и уроки</li>
          <li><code>GET /api/v1/lessons/[id]</code> - урок с заданием</li>
          <li><code>POST /api/v1/users</code> - создать студента (scope manage:users)</li>
        </ul>
      </article>

      <article className="lesson-card span-12">
        <h3>Активные ключи</h3>
        {keys.length ? keys.map((item) => (
          <div className="admin-row" key={item.id}>
            <span>
              {item.name}
              <small>
                {item.prefix}… · {item.company} · {item.scopes.join(", ")}
              </small>
            </span>
            {item.active ? (
              <button className="course-button" onClick={() => revoke(item.id)} type="button">
                Отозвать
              </button>
            ) : (
              <strong>Отозван</strong>
            )}
          </div>
        )) : (
          <p className="lesson-text">Ключей пока нет.</p>
        )}
      </article>
    </div>
  );
}
