"use client";

import { FormEvent, useState } from "react";

type Option = { id: string; label: string };

export function CourseAssignmentForm({
  courses,
  departments,
  employees
}: {
  courses: Option[];
  departments: Option[];
  employees: Option[];
}) {
  const [scope, setScope] = useState<"COMPANY" | "DEPARTMENT" | "USER">("COMPANY");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload: Record<string, string> = {
      courseSlug: String(form.get("courseSlug")),
      scope
    };

    if (scope === "DEPARTMENT") payload.departmentId = String(form.get("departmentId"));
    if (scope === "USER") payload.userId = String(form.get("userId"));

    const response = await fetch("/api/company/course-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Не удалось назначить курс.");
      return;
    }

    setMessage(`Курс «${data.assignment.course.title}» назначен.`);
    window.location.reload();
  }

  return (
    <form className="auth-form auth-form--register" onSubmit={onSubmit}>
      <label className="auth-form__full">
        Курс
        <select name="courseSlug" required>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="auth-form__full">
        Кому назначить
        <select name="scope" onChange={(e) => setScope(e.target.value as typeof scope)} value={scope}>
          <option value="COMPANY">Вся компания</option>
          <option value="DEPARTMENT">Отдел</option>
          <option value="USER">Конкретный сотрудник</option>
        </select>
      </label>
      {scope === "DEPARTMENT" ? (
        <label className="auth-form__full">
          Отдел
          <select name="departmentId" required>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {scope === "USER" ? (
        employees.length ? (
          <label className="auth-form__full">
            Сотрудник
            <select name="userId" required>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="lesson-text">Нет активных сотрудников — пригласите коллег в разделе «Приглашения».</p>
        )
      ) : null}
      <button
        className="course-button is-primary"
        disabled={loading || (scope === "USER" && !employees.length) || (scope === "DEPARTMENT" && !departments.length)}
        type="submit"
      >
        {loading ? "Назначаем..." : "Назначить курс"}
      </button>
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </form>
  );
}

export function CourseAssignmentRemoveButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function remove() {
    setLoading(true);
    await fetch(`/api/company/course-assignments?id=${id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button className="course-button" disabled={loading} onClick={remove} type="button">
      Снять
    </button>
  );
}
