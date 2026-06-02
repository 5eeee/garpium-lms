import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/session";
import { knowledgeCategoryCreateSchema } from "@/lib/validators";
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

  const categories = await db.knowledgeCategory.findMany({
    where: { companyId: admin.companyId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { articles: true } } }
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const session = await requireCompanyAdmin();
  const admin = await getAdminCompany(session.user.email!);
  if (!admin) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = knowledgeCategoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте название категории." }, { status: 400 });
  }

  const baseSlug = makeKnowledgeSlug(parsed.data.name);
  let slug = baseSlug;
  let suffix = 2;
  while (await db.knowledgeCategory.findFirst({ where: { companyId: admin.companyId, slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const maxOrder = await db.knowledgeCategory.aggregate({
    where: { companyId: admin.companyId },
    _max: { order: true }
  });

  const category = await db.knowledgeCategory.create({
    data: {
      companyId: admin.companyId,
      name: parsed.data.name,
      slug,
      order: (maxOrder._max.order ?? -1) + 1
    }
  });

  await writeAuditLog({
    userId: admin.id,
    companyId: admin.companyId,
    action: "knowledge.category.create",
    description: `Создана категория Wiki «${category.name}»`
  });

  return NextResponse.json({ category });
}
