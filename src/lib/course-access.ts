import { db } from "@/lib/db";

type AccessUser = {
  id: string;
  companyId: string | null;
  company?: { isGarpium: boolean; verificationStatus: string } | null;
  memberships?: { departmentId: string | null; status: string }[];
};

export async function getAccessibleCourseSlugs(user: AccessUser): Promise<string[] | "all"> {
  if (!user.companyId || !user.company) {
    return "all";
  }

  if (user.company.isGarpium) {
    return "all";
  }

  if (user.company.verificationStatus !== "VERIFIED") {
    return [];
  }

  const assignments = await db.courseAssignment.findMany({
    where: { companyId: user.companyId },
    include: { course: { select: { slug: true } } }
  });

  if (!assignments.length) {
    return "all";
  }

  const membership = user.memberships?.find((m) => m.status === "ACTIVE");
  const departmentId = membership?.departmentId ?? null;
  const slugs = new Set<string>();

  for (const assignment of assignments) {
    if (assignment.scope === "COMPANY") {
      slugs.add(assignment.course.slug);
    } else if (assignment.scope === "DEPARTMENT" && assignment.departmentId === departmentId) {
      slugs.add(assignment.course.slug);
    } else if (assignment.scope === "USER" && assignment.userId === user.id) {
      slugs.add(assignment.course.slug);
    }
  }

  return [...slugs];
}

export async function userCanAccessCourse(user: AccessUser, courseSlug: string) {
  const access = await getAccessibleCourseSlugs(user);
  if (access === "all") return true;
  return access.includes(courseSlug);
}

export function lessonTrackSlug(lessonId: string): "html" | "css" | null {
  if (lessonId.startsWith("h-")) return "html";
  if (lessonId.startsWith("c-")) return "css";
  return null;
}

export function assignmentScopeLabel(scope: string) {
  const labels: Record<string, string> = {
    COMPANY: "Вся компания",
    DEPARTMENT: "Отдел",
    USER: "Сотрудник"
  };
  return labels[scope] || scope;
}
