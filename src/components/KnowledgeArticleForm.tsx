"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { KnowledgeVisibility } from "@prisma/client";

type CategoryOption = { id: string; name: string };
type DepartmentOption = { id: string; name: string };

type ArticleFormValues = {
  title: string;
  content: string;
  categoryId?: string;
  visibility: KnowledgeVisibility;
  departmentId?: string;
  published: boolean;
};

export function KnowledgeArticleForm({
  categories,
  departments,
  articleId,
  initial,
  submitLabel = "Сохранить статью"
}: {
  categories: CategoryOption[];
  departments: DepartmentOption[];
  articleId?: string;
  initial?: Partial<ArticleFormValues>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<KnowledgeVisibility>(initial?.visibility ?? "COMPANY");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      content: form.get("content"),
      categoryId: form.get("categoryId") || undefined,
      visibility: form.get("visibility") || "COMPANY",
      departmentId: form.get("departmentId") || undefined,
      published: form.get("published") === "on"
    };

    const url = articleId
      ? `/api/company/knowledge/articles/${articleId}`
      : "/api/company/knowledge/articles";
    const method = articleId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Не удалось сохранить статью.");
      return;
    }

    setMessage(articleId ? "Статья обновлена." : "Статья создана.");
    if (articleId) {
      router.refresh();
      return;
    }

    window.location.href = `/company/knowledge/${data.article.slug}`;
  }

  return (
    <div>
      <form className="auth-form auth-form--register" onSubmit={onSubmit}>
        <label className="auth-form__full">
          Заголовок
          <input name="title" maxLength={200} required defaultValue={initial?.title ?? ""} placeholder="Как оформить отпуск" />
        </label>
        <label className="auth-form__full">
          Категория
          <select name="categoryId" defaultValue={initial?.categoryId ?? ""}>
            <option value="">Без категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <label className="auth-form__full">
          Видимость
          <select
            name="visibility"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as KnowledgeVisibility)}
          >
            <option value="COMPANY">Вся компания</option>
            <option value="DEPARTMENT">Только отдел</option>
            <option value="MANAGERS">Руководители</option>
            <option value="ADMINS">Администраторы</option>
          </select>
        </label>
        {visibility === "DEPARTMENT" ? (
          <label className="auth-form__full">
            Отдел
            <select name="departmentId" required defaultValue={initial?.departmentId ?? ""}>
              <option value="">Выберите отдел</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="auth-form__full">
          Текст статьи
          <textarea
            name="content"
            required
            rows={12}
            defaultValue={initial?.content ?? ""}
            placeholder="Опишите процесс, регламент или инструкцию..."
          />
        </label>
        <label className="auth-form__full" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input name="published" type="checkbox" defaultChecked={initial?.published ?? true} />
          Опубликована (видна сотрудникам по правам доступа)
        </label>
        <button className="course-button is-primary" disabled={loading} type="submit">
          {loading ? "Сохраняем..." : submitLabel}
        </button>
      </form>
      {message ? <p className="auth-message">{message}</p> : null}
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </div>
  );
}

export function KnowledgeArticleDeleteButton({ articleId, title }: { articleId: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    if (!window.confirm(`Удалить статью «${title}»?`)) return;
    setLoading(true);
    setError("");

    const response = await fetch(`/api/company/knowledge/articles/${articleId}`, { method: "DELETE" });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Не удалось удалить статью.");
      return;
    }

    router.push("/company/knowledge");
    router.refresh();
  }

  return (
    <div>
      <button className="course-button" disabled={loading} onClick={onDelete} type="button">
        {loading ? "Удаляем..." : "Удалить статью"}
      </button>
      {error ? <p className="auth-message is-error">{error}</p> : null}
    </div>
  );
}
