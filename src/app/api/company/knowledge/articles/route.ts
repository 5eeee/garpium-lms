import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/session";
import { knowledgeArticleCreateSchema } from "@/lib/validators";
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

export async function GET() {
  const session = await requireCompanyAdmin();
  const admin = await getAdminCompany(session.user.email!);
  if (!admin) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }

  const articles = await db.knowledgeArticle.findMany({
    where: { companyId: admin.companyId },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      department: { select: { id: true, name: true } },
      author: { select: { firstName: true, lastName: true } }
    }
  });

  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const session = await requireCompanyAdmin();
  const admin = await getAdminCompany(session.user.email!);
  if (!admin) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = knowledgeArticleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте заголовок и текст статьи." }, { status: 400 });
  }

  if (parsed.data.visibility === "DEPARTMENT" && !parsed.data.departmentId) {
    return NextResponse.json({ error: "Выберите отдел для ограничения доступа." }, { status: 400 });
  }

  if (parsed.data.categoryId) {
    const category = await db.knowledgeCategory.findFirst({
      where: { id: parsed.data.categoryId, companyId: admin.companyId }
    });
    if (!category) {
      return NextResponse.json({ error: "Категория не найдена." }, { status: 404 });
    }
  }

  if (parsed.data.departmentId) {
    const department = await db.department.findFirst({
      where: { id: parsed.data.departmentId, companyId: admin.companyId }
    });
    if (!department) {
      return NextResponse.json({ error: "Отдел не найден." }, { status: 404 });
    }
  }

  const baseSlug = makeKnowledgeSlug(parsed.data.title);
  let slug = baseSlug;
  let suffix = 2;
  while (await db.knowledgeArticle.findFirst({ where: { companyId: admin.companyId, slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const article = await db.knowledgeArticle.create({
    data: {
      companyId: admin.companyId,
      authorId: admin.id,
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId,
      visibility: parsed.data.visibility,
      departmentId: parsed.data.visibility === "DEPARTMENT" ? parsed.data.departmentId : null,
      published: parsed.data.published
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      department: { select: { id: true, name: true } }
    }
  });

  await writeAuditLog({
    userId: admin.id,
    companyId: admin.companyId,
    action: "knowledge.article.create",
    description: `Создана статья Wiki «${article.title}»`
  });

  return NextResponse.json({ article });
}
