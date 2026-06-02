import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApprovedApiSession } from "@/lib/api-session";

export async function POST(request: Request) {
  const session = await getApprovedApiSession();
  if (!session) {
    return NextResponse.json({ error: "Нужен одобренный аккаунт." }, { status: 401 });
  }

  const userId = session.user.id!;
  const body = await request.json().catch(() => ({} as { courseSlug?: string }));
  const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug : null;

  const [course, existing] = await Promise.all([
    courseSlug
      ? db.course.findUnique({
          where: { slug: courseSlug },
          include: { modules: { include: { lessons: { select: { id: true } } } } }
        })
      : db.course.findFirst({
          orderBy: { order: "asc" },
          include: { modules: { include: { lessons: { select: { id: true } } } } }
        }),
    db.certificate.findFirst({ where: { userId, status: "ISSUED" }, orderBy: { issuedAt: "desc" } })
  ]);

  if (existing) {
    return NextResponse.json({ certificate: existing });
  }

  if (!course) {
    return NextResponse.json({ error: "Курс не найден." }, { status: 404 });
  }

  const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  if (lessonIds.length === 0) {
    return NextResponse.json({ error: "В курсе пока нет уроков." }, { status: 400 });
  }

  const done = await db.progress.count({
    where: { userId, status: "DONE", lessonId: { in: lessonIds } }
  });

  if (done < lessonIds.length) {
    return NextResponse.json({ error: `Нужно пройти все уроки курса: ${done}/${lessonIds.length}.` }, { status: 400 });
  }

  const certificate = await db.certificate.create({
    data: {
      userId,
      status: "ISSUED",
      issuedAt: new Date(),
      number: `GARP-${Date.now()}-${userId.slice(0, 6).toUpperCase()}`
    }
  });

  return NextResponse.json({ certificate });
}
