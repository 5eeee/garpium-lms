import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireCompanyAdmin, getCompanyForAdmin } from "@/lib/session";
import { knowledgeVisibilityLabel } from "@/lib/knowledge-access";
import { KnowledgeArticleForm, KnowledgeArticleDeleteButton } from "@/components/KnowledgeArticleForm";

export const dynamic = "force-dynamic";

export default async function CompanyKnowledgeArticlePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireCompanyAdmin();
  const company = await getCompanyForAdmin();
  if (!company) return null;

  const { slug } = await params;

  const article = await db.knowledgeArticle.findFirst({
    where: { companyId: company.id, slug },
    include: {
      category: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } }
    }
  });

  if (!article) notFound();

  const [categories, departments] = await Promise.all([
    db.knowledgeCategory.findMany({
      where: { companyId: company.id },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true }
    }),
    db.department.findMany({
      where: { companyId: company.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Wiki · {article.category?.name ?? "Статья"}</span>
        <h1 className="course-title">{article.title}</h1>
        <p className="course-lead">
          {knowledgeVisibilityLabel(article.visibility)}
          {article.department ? ` · ${article.department.name}` : ""}
          {!article.published ? " · черновик" : ""}
        </p>
      </header>

      <section className="lesson-grid">
        <article className="lesson-card span-12">
          <span className="card-label">Редактирование</span>
          <KnowledgeArticleForm
            articleId={article.id}
            categories={categories}
            departments={departments}
            initial={{
              title: article.title,
              content: article.content,
              categoryId: article.categoryId ?? undefined,
              visibility: article.visibility,
              departmentId: article.departmentId ?? undefined,
              published: article.published
            }}
          />
        </article>

        <article className="lesson-card span-12">
          <span className="card-label">Опасная зона</span>
          <KnowledgeArticleDeleteButton articleId={article.id} title={article.title} />
        </article>
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/company/knowledge">
          ← Все статьи
        </Link>
        <Link className="course-button is-accent" href={`/knowledge/${article.slug}`}>
          Как видят сотрудники
        </Link>
      </footer>
    </>
  );
}
