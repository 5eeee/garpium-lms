import { db } from "@/lib/db";
import { ensureProfileSchema } from "@/lib/ensure-profile-schema";
import { getAccessibleCourseSlugs } from "@/lib/course-access";
import { canAccessCompanyPanel, isSuperAdmin } from "@/lib/roles";
import { userLevelFromPoints, userLevelTitle } from "@/lib/user-level";
import type { Role } from "@prisma/client";

export async function getDashboardData(email: string) {
  await ensureProfileSchema();

  const user = await db.user.findUnique({
    where: { email },
    include: {
      company: true,
      certificates: { orderBy: { issuedAt: "desc" }, take: 5 },
      progress: true,
      memberships: {
        where: { status: "ACTIVE" },
        include: { department: true, company: true }
      },
      joinRequests: {
        where: { status: "PENDING" },
        include: { company: true },
        orderBy: { createdAt: "desc" },
        take: 3
      },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 8 }
    }
  });

  if (!user) return null;

  const membership = user.memberships[0] ?? null;
  const doneProgress = user.progress.filter((p) => p.status === "DONE");
  const completedLessons = doneProgress.length;
  const issuedCerts = user.certificates.filter((c) => c.status === "ISSUED");
  const level = userLevelFromPoints(user.points);

  const courseAccess =
    user.company
      ? await getAccessibleCourseSlugs({
          id: user.id,
          companyId: user.companyId,
          company: user.company,
          memberships: user.memberships
        })
      : "all";

  const allCourses = await db.course.findMany({
    orderBy: { order: "asc" },
    include: { modules: { include: { lessons: { select: { id: true, order: true } } }, orderBy: { order: "asc" } } }
  });
  const accessibleCourses =
    courseAccess === "all"
      ? allCourses
      : allCourses.filter((c) => courseAccess.includes(c.slug));

  let companyStats = null;
  if (user.companyId && user.company) {
    const [employees, departments, assignments, companyCerts] = await Promise.all([
      db.organizationMember.count({ where: { companyId: user.companyId, status: "ACTIVE" } }),
      db.department.count({ where: { companyId: user.companyId } }),
      db.courseAssignment.count({ where: { companyId: user.companyId } }),
      db.certificate.count({
        where: { user: { companyId: user.companyId }, status: "ISSUED" }
      })
    ]);

    const companyProgress = await db.progress.count({
      where: { user: { companyId: user.companyId }, status: "DONE" }
    });

    companyStats = {
      employees,
      departments,
      activeCourses: assignments,
      certificates: companyCerts,
      completionPercent: employees > 0 ? Math.min(100, Math.round((companyProgress / (employees * 10)) * 100)) : 0
    };
  }

  let platformStats = null;
  if (isSuperAdmin(user.role)) {
    const [orgs, users, pendingOrgs] = await Promise.all([
      db.company.count(),
      db.user.count(),
      db.company.count({ where: { verificationStatus: "PENDING_VERIFICATION" } })
    ]);
    platformStats = { orgs, users, pendingOrgs };
  }

  return {
    user,
    membership,
    level,
    levelTitle: userLevelTitle(level),
    completedLessons,
    issuedCerts,
    accessibleCourses,
    courseAccess,
    companyStats,
    platformStats,
    showCompanyPanel: canAccessCompanyPanel(user.role),
    showPlatformPanel: isSuperAdmin(user.role),
    role: user.role as Role
  };
}
