import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireApproved } from "@/lib/session";
import {
  canReadKnowledgeArticle,
  getKnowledgeAccessUser,
  knowledgeVisibilityLabel
} from "@/lib/knowledge-access";
import { isCompanyAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function KnowledgeArticlePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireApproved();
  const { slug } = await params;

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    include: { company: true }
  });

  if (!user?.companyId) {
    redirect("/knowledge");
  }

  const article = await db.knowledgeArticle.findFirst({
    where: { companyId: user.companyId, slug },
    include: {
      category: { select: { name: true } },
      department: { select: { name: true } },
      author: { select: { firstName: true, lastName: true } }
    }
  });

  if (!article) notFound();

  const accessUser = await getKnowledgeAccessUser(user.id);
  const canRead =
    accessUser &&
    (canReadKnowledgeArticle(accessUser, article) ||
      (isCompanyAdmin(user.role) && user.companyId === article.companyId));

  if (!canRead) {
    redirect("/knowledge");
  }

  const updated = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(article.updatedAt);

  return (
    <>
      <header className="course-top">
        <span className="course-kicker">{article.category?.name ?? "Wiki"}</span>
        <h1 className="course-title">{article.title}</h1>
        <p className="course-lead">
          {knowledgeVisibilityLabel(article.visibility)}
          {article.department ? ` · ${article.department.name}` : ""}
          {" · "}обновлено {updated}
        </p>
      </header>

      <section className="lesson-grid">
        <article className="explain-card span-12">
          <div className="lesson-text" style={{ whiteSpace: "pre-wrap" }}>
            {article.content}
          </div>
          <p className="card-label" style={{ marginTop: 24 }}>
            Автор: {article.author.firstName} {article.author.lastName}
          </p>
        </article>
      </section>

      <footer className="course-footer">
        <Link className="course-button" href="/knowledge">
          ← База знаний
        </Link>
      </footer>
    </>
  );
}
