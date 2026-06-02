import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/session";
import { knowledgeArticleUpdateSchema } from "@/lib/validators";
import { makeKnowledgeSlug } from "@/lib/knowledge-slug";
import { writeAuditLog } from "@/lib/audit";

async function getAdminCompany(email: string): Promise<{ id: string; companyId: string } | null> {
  const admin = await db.user.findUnique({
    where: { email },
    select: { id: true, companyId: true }
  });
  if (!admin?.companyId) return null;
  return { id: admin.id, companyId: admin.companyId };
}

export async function PATCH(request: Request, context: { params: Promise<{ articleId: string }> }) {
  const session = await requireCompanyAdmin();
  const { articleId } = await context.params;
  const admin = await getAdminCompany(session.user.email!);
  if (!admin?.companyId) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }
  const companyId = admin.companyId;

  const existing = await db.knowledgeArticle.findFirst({
    where: { id: articleId, companyId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Статья не найдена." }, { status: 404 });
  }

  const parsed = knowledgeArticleUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте данные статьи." }, { status: 400 });
  }

  const visibility = parsed.data.visibility ?? existing.visibility;
  const departmentId =
    visibility === "DEPARTMENT"
      ? parsed.data.departmentId ?? existing.departmentId
      : null;

  if (visibility === "DEPARTMENT" && !departmentId) {
    return NextResponse.json({ error: "Выберите отдел для ограничения доступа." }, { status: 400 });
  }

  if (parsed.data.categoryId) {
    const category = await db.knowledgeCategory.findFirst({
      where: { id: parsed.data.categoryId, companyId }
    });
    if (!category) {
      return NextResponse.json({ error: "Категория не найдена." }, { status: 404 });
    }
  }

  if (departmentId) {
    const department = await db.department.findFirst({
      where: { id: departmentId, companyId }
    });
    if (!department) {
      return NextResponse.json({ error: "Отдел не найден." }, { status: 404 });
    }
  }

  let slug = existing.slug;
  if (parsed.data.title && parsed.data.title !== existing.title) {
    const baseSlug = makeKnowledgeSlug(parsed.data.title);
    slug = baseSlug;
    let suffix = 2;
    while (
      await db.knowledgeArticle.findFirst({
        where: { companyId, slug, NOT: { id: existing.id } }
      })
    ) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  const article = await db.knowledgeArticle.update({
    where: { id: existing.id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId,
      visibility,
      departmentId,
      published: parsed.data.published,
      slug
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      department: { select: { id: true, name: true } }
    }
  });

  await writeAuditLog({
    userId: admin.id,
    companyId,
    action: "knowledge.article.update",
    description: `Обновлена статья Wiki «${article.title}»`
  });

  return NextResponse.json({ article });
}

export async function DELETE(_request: Request, context: { params: Promise<{ articleId: string }> }) {
  const session = await requireCompanyAdmin();
  const { articleId } = await context.params;
  const admin = await getAdminCompany(session.user.email!);
  if (!admin?.companyId) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }
  const companyId = admin.companyId;

  const existing = await db.knowledgeArticle.findFirst({
    where: { id: articleId, companyId }
  });
  if (!existing) {
    return NextResponse.json({ error: "Статья не найдена." }, { status: 404 });
  }

  await db.knowledgeArticle.delete({ where: { id: existing.id } });

  await writeAuditLog({
    userId: admin.id,
    companyId,
    action: "knowledge.article.delete",
    description: `Удалена статья Wiki «${existing.title}»`
  });

  return NextResponse.json({ ok: true });
}
