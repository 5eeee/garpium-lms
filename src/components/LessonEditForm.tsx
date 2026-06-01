"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LessonPayload = {
  id: string;
  title: string;
  simple: string;
  order: number;
  points: number;
  content: { theory?: string; simple?: string };
  visual: { type?: string } | null;
  tasks: Array<{
    label: string;
    starter: string;
    preview: string;
    primary: string[];
    acceptable: string[];
  }>;
};

export function LessonEditForm({ lesson }: { lesson: LessonPayload }) {
  const router = useRouter();
  const task = lesson.tasks[0];
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        simple: form.get("simple"),
        theory: form.get("theory"),
        order: Number(form.get("order")),
        points: Number(form.get("points")),
        visualType: form.get("visualType"),
        task: {
          label: form.get("taskLabel"),
          starter: form.get("taskStarter"),
          preview: form.get("taskPreview"),
          primary: String(form.get("taskPrimary") || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          acceptable: String(form.get("taskAcceptable") || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        }
      })
    });

    const data = await response.json();
    setLoading(false);
    setError(!response.ok);
    setMessage(data.message || data.error || "Готово.");
    if (response.ok) router.refresh();
  }

  return (
    <form className="lesson-edit-form" onSubmit={onSubmit}>
      <label>
        Заголовок
        <input defaultValue={lesson.title} name="title" required />
      </label>
      <label>
        Краткое описание
        <textarea defaultValue={lesson.simple} name="simple" required />
      </label>
      <label>
        Теория (полный текст)
        <textarea defaultValue={lesson.content?.theory || lesson.simple} name="theory" />
      </label>
      <label>
        Порядок
        <input defaultValue={lesson.order} name="order" type="number" />
      </label>
      <label>
        Очки
        <input defaultValue={lesson.points} name="points" type="number" />
      </label>
      <label>
        Тип визуализации
        <input defaultValue={lesson.visual?.type || "structure"} name="visualType" />
      </label>

      {task ? (
        <>
          <h3>Задание</h3>
          <label>
            Название задания
            <input defaultValue={task.label} name="taskLabel" />
          </label>
          <label>
            Стартовый код
            <textarea defaultValue={task.starter} name="taskStarter" />
          </label>
          <label>
            HTML превью
            <textarea defaultValue={task.preview} name="taskPreview" />
          </label>
          <label>
            Правильные ответы (по одному на строку)
            <textarea defaultValue={task.primary.join("\n")} name="taskPrimary" />
          </label>
          <label>
            Допустимые ответы (по одному на строку)
            <textarea defaultValue={task.acceptable.join("\n")} name="taskAcceptable" />
          </label>
        </>
      ) : null}

      <div className="admin-actions">
        <button className="course-button is-primary" disabled={loading} type="submit">
          {loading ? "Сохраняем..." : "Сохранить урок"}
        </button>
      </div>

      {message ? <p className={`form-message${error ? " is-error" : ""}`}>{message}</p> : null}
    </form>
  );
}
