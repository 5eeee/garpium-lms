import Link from "next/link";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";
import { ensureDefaultKnowledgeCategories, knowledgeVisibilityLabel } from "@/lib/knowledge-access";
import { KnowledgeCategoryForm } from "@/components/KnowledgeCategoryForm";
import { KnowledgeArticleForm } from "@/components/KnowledgeArticleForm";

export const dynamic = "force-dynamic";

export default async function CompanyKnowledgePage() {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  await ensureDefaultKnowledgeCategories(company.id);

  const [categories, departments, articles] = await Promise.all([
    db.knowledgeCategory.findMany({
      where: { companyId: company.id },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { articles: true } } }
    }),
    db.department.findMany({
      where: { companyId: company.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    db.knowledgeArticle.findMany({
      where: { companyId: company.id },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        category: { select: { name: true } },
        department: { select: { name: true } }
      }
    })
  ]);

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Wiki</span>
        <h1 className="course-title">База знаний {company.name}</h1>
        <p className="course-lead">
          Корпоративная Wiki: инструкции, регламенты и FAQ с правами доступа по отделам и ролям.
        </p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-6">
          <span className="card-label">Категории</span>
          <KnowledgeCategoryForm />
        </article>

        <article className="lesson-card span-6">
          <span className="card-label">Коллекции</span>
          {categories.length ? (
            categories.map((cat) => (
              <div className="admin-row" key={cat.id}>
                <span>
                  {cat.name}
                  <small>{cat._count.articles} статей</small>
                </span>
              </div>
            ))
          ) : (
            <p className="lesson-text">Добавьте первую категорию.</p>
          )}
        </article>

        <article className="lesson-card span-12">
          <span className="card-label">Новая статья</span>
          <KnowledgeArticleForm categories={categories} departments={departments} submitLabel="Создать статью" />
        </article>

        <article className="lesson-card span-12">
          <span className="card-label">Все статьи ({articles.length})</span>
          {articles.length ? (
            articles.map((article) => (
              <div className="admin-row" key={article.id}>
                <span>
                  <Link href={`/company/knowledge/${article.slug}`}>{article.title}</Link>
                  <small>
                    {article.category?.name ?? "Без категории"} · {knowledgeVisibilityLabel(article.visibility)}
                    {article.department ? ` · ${article.department.name}` : ""}
                    {!article.published ? " · черновик" : ""}
                  </small>
                </span>
                <Link className="course-button" href={`/knowledge/${article.slug}`}>
                  Просмотр
                </Link>
              </div>
            ))
          ) : (
            <p className="lesson-text">Статей пока нет. Создайте первую инструкцию или регламент.</p>
          )}
        </article>
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/company">
          ← Дашборд
        </Link>
      </footer>
    </>
  );
}
