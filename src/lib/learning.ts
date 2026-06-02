import { db } from "@/lib/db";
import { getAccessibleCourseSlugs } from "@/lib/course-access";

export type LearningUser = {
  id: string;
  companyId: string | null;
  company?: { isGarpium: boolean; verificationStatus: string } | null;
  memberships?: { departmentId: string | null; status: string }[];
};

export async function canUserAccessCourse(user: LearningUser, courseSlug: string) {
  const access = user.company
    ? await getAccessibleCourseSlugs({
        id: user.id,
        companyId: user.companyId,
        company: user.company,
        memberships: user.memberships
      })
    : "all";

  return access === "all" || access.includes(courseSlug);
}

export function courseProgress({
  doneLessonIds,
  totalLessons
}: {
  doneLessonIds: Set<string>;
  totalLessons: number;
}) {
  const done = doneLessonIds.size;
  return {
    done,
    total: totalLessons,
    percent: totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0
  };
}

export async function getCourseDoneLessonIds(userId: string, lessonIds: string[]) {
  const rows = await db.progress.findMany({
    where: { userId, lessonId: { in: lessonIds }, status: "DONE" },
    select: { lessonId: true }
  });

  return new Set(rows.map((row) => row.lessonId));
}
