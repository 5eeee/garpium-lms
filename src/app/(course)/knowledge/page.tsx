import Link from "next/link";
import { db } from "@/lib/db";
import { requireApproved } from "@/lib/session";
import {
  buildReadableArticlesWhere,
  getKnowledgeAccessUser,
  knowledgeVisibilityLabel
} from "@/lib/knowledge-access";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const session = await requireApproved();
  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    include: { company: true }
  });

  if (!user) return null;

  const accessUser = await getKnowledgeAccessUser(user.id);
  const where = accessUser ? buildReadableArticlesWhere(accessUser) : null;

  const articles = where
    ? await db.knowledgeArticle.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }],
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { firstName: true, lastName: true } }
        }
      })
    : [];

  const categories = where
    ? await db.knowledgeCategory.findMany({
        where: { companyId: accessUser!.companyId! },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: {
          articles: {
            where: { published: true, OR: where.OR },
            select: { id: true, title: true, slug: true, visibility: true },
            orderBy: { title: "asc" }
          }
        }
      })
    : [];

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">Knowledge Base</span>
        <h1 className="course-title">База знаний</h1>
        <p className="course-lead">
          {user.company
            ? `Корпоративная Wiki ${user.company.name}. Статьи доступны по вашей роли и отделу.`
            : "Подключитесь к компании, чтобы читать корпоративные материалы."}
        </p>
      </header>

      {!user.company ? (
        <section className="lesson-grid">
          <article className="explain-card span-12">
            <h2>Нет доступа к Wiki компании</h2>
            <p className="lesson-text">
              Создайте организацию или присоединитесь по приглашению — тогда здесь появятся инструкции и регламенты.
            </p>
            <div className="course-footer">
              <Link className="course-button is-accent" href="/dashboard#company">
                Моя компания
              </Link>
              <Link className="course-button" href="/support">
                Помощь
              </Link>
            </div>
          </article>
        </section>
      ) : articles.length === 0 ? (
        <section className="lesson-grid">
          <article className="explain-card span-12">
            <h2>Пока нет опубликованных статей</h2>
            <p className="lesson-text">
              Администратор компании добавит инструкции и регламенты в разделе «База знаний» панели компании.
            </p>
            <Link className="course-button" href="/learn">
              Перейти к обучению
            </Link>
          </article>
        </section>
      ) : (
        <section className="lesson-grid">
          {categories
            .filter((cat) => cat.articles.length > 0)
            .map((cat) => (
              <article className="lesson-card span-6" key={cat.id}>
                <span className="card-label">{cat.name}</span>
                {cat.articles.map((article) => (
                  <div className="admin-row" key={article.id}>
                    <span>
                      <Link href={`/knowledge/${article.slug}`}>{article.title}</Link>
                      <small>{knowledgeVisibilityLabel(article.visibility)}</small>
                    </span>
                  </div>
                ))}
              </article>
            ))}

          {articles.filter((a) => !a.categoryId).length > 0 ? (
            <article className="lesson-card span-6">
              <span className="card-label">Без категории</span>
              {articles
                .filter((a) => !a.categoryId)
                .map((article) => (
                  <div className="admin-row" key={article.id}>
                    <Link href={`/knowledge/${article.slug}`}>{article.title}</Link>
                  </div>
                ))}
            </article>
          ) : null}
        </section>
      )}
    </>
  );
}
