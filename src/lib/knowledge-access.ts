import type { KnowledgeVisibility, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { isCompanyAdmin, isCompanyLeader } from "@/lib/roles";

export type KnowledgeAccessUser = {
  id: string;
  role: Role | string;
  companyId: string | null;
  departmentId: string | null;
};

export type KnowledgeArticleAcl = {
  companyId: string;
  visibility: KnowledgeVisibility;
  departmentId: string | null;
  published: boolean;
};

export function canReadKnowledgeArticle(user: KnowledgeAccessUser, article: KnowledgeArticleAcl) {
  if (!user.companyId || user.companyId !== article.companyId) {
    return false;
  }

  if (!article.published) {
    return isCompanyAdmin(user.role);
  }

  switch (article.visibility) {
    case "COMPANY":
      return true;
    case "DEPARTMENT":
      return !!article.departmentId && article.departmentId === user.departmentId;
    case "MANAGERS":
      return isCompanyLeader(user.role);
    case "ADMINS":
      return isCompanyAdmin(user.role);
    default:
      return false;
  }
}

export function knowledgeVisibilityLabel(visibility: KnowledgeVisibility) {
  const labels: Record<KnowledgeVisibility, string> = {
    COMPANY: "Вся компания",
    DEPARTMENT: "Отдел",
    MANAGERS: "Руководители",
    ADMINS: "Администраторы"
  };
  return labels[visibility];
}

export async function getKnowledgeAccessUser(userId: string): Promise<KnowledgeAccessUser | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      companyId: true,
      memberships: {
        where: { status: "ACTIVE" },
        select: { companyId: true, departmentId: true }
      }
    }
  });

  if (!user) return null;

  const membership = user.memberships.find((m) => m.companyId === user.companyId) ?? user.memberships[0];

  return {
    id: user.id,
    role: user.role,
    companyId: user.companyId,
    departmentId: membership?.departmentId ?? null
  };
}

export function buildReadableArticlesWhere(user: KnowledgeAccessUser) {
  if (!user.companyId) {
    return null;
  }

  const or: Array<{
    visibility: KnowledgeVisibility;
    departmentId?: string | null;
  }> = [{ visibility: "COMPANY" }];

  if (user.departmentId) {
    or.push({ visibility: "DEPARTMENT", departmentId: user.departmentId });
  }
  if (isCompanyLeader(user.role)) {
    or.push({ visibility: "MANAGERS" });
  }
  if (isCompanyAdmin(user.role)) {
    or.push({ visibility: "ADMINS" });
  }

  return {
    companyId: user.companyId,
    published: true,
    OR: or
  };
}

export const DEFAULT_KNOWLEDGE_CATEGORIES = [
  "Инструкции",
  "Регламенты",
  "Процессы",
  "Шаблоны",
  "FAQ",
  "Документация"
] as const;

export async function ensureDefaultKnowledgeCategories(companyId: string) {
  const count = await db.knowledgeCategory.count({ where: { companyId } });
  if (count > 0) return;

  const { makeKnowledgeSlug } = await import("@/lib/knowledge-slug");

  await db.knowledgeCategory.createMany({
    data: DEFAULT_KNOWLEDGE_CATEGORIES.map((name, index) => ({
      companyId,
      name,
      slug: makeKnowledgeSlug(name),
      order: index
    }))
  });
}
