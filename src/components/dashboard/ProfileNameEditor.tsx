"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function formatName(first: string, last: string, middle: string | null) {
  if (middle) return `${first} ${middle} ${last}`;
  return `${first} ${last}`;
}

export function ProfileNameEditor({
  firstName,
  lastName,
  middleName
}: {
  firstName: string;
  lastName: string;
  middleName: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [middle, setMiddle] = useState(middleName || "");
  const [noMiddle, setNoMiddle] = useState(!middleName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/profile/name", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: first,
        lastName: last,
        middleName: noMiddle ? null : middle.trim() || null
      })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Не удалось сохранить.");
      return;
    }
    if (noMiddle) setMiddle("");
    setEditing(false);
    router.refresh();
  }

  function cancel() {
    setFirst(firstName);
    setLast(lastName);
    setMiddle(middleName || "");
    setNoMiddle(!middleName);
    setEditing(false);
    setError("");
  }

  if (editing) {
    return (
      <div className="pdata-row pdata-row--stack">
        <form className="pdata-name-edit" onSubmit={save}>
          <input placeholder="Имя" required value={first} onChange={(e) => setFirst(e.target.value)} />
          <input placeholder="Фамилия" required value={last} onChange={(e) => setLast(e.target.value)} />
          {!noMiddle ? (
            <input placeholder="Отчество" value={middle} onChange={(e) => setMiddle(e.target.value)} />
          ) : null}
          <label className="pdata-name-edit__skip">
            <input checked={noMiddle} type="checkbox" onChange={(e) => setNoMiddle(e.target.checked)} />
            Без отчества
          </label>
          <button className="course-button account-head__save" disabled={loading} type="submit">
            {loading ? "..." : "Сохранить"}
          </button>
          <button className="course-button account-head__cancel" type="button" onClick={cancel}>
            Отмена
          </button>
        </form>
        {error ? <p className="pdata-msg is-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="pdata-row">
      <span className="pdata-row__label">ФИО</span>
      <div className="pdata-row__value">{formatName(firstName, lastName, middleName)}</div>
      <button className="course-button pdata-row__btn" type="button" onClick={() => setEditing(true)}>
        Изменить
      </button>
    </div>
  );
}
