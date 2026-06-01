import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLesson } from "@/lib/course-data";
import { getApprovedApiSession } from "@/lib/api-session";

export async function POST(request: Request) {
  const session = await getApprovedApiSession();
  if (!session) {
    return NextResponse.json({ error: "Нужен одобренный аккаунт." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const lesson = body?.lessonId ? getLesson(body.lessonId) : null;

  if (!lesson || !session.user.id) {
    return NextResponse.json({ error: "Урок не найден." }, { status: 404 });
  }

  const task = await db.task.findFirst({ where: { lessonId: lesson.id } });
  if (!task) {
    return NextResponse.json({ saved: false, message: "Попытка проверена локально. Задание ещё не синхронизировано с БД." });
  }

  const tier = body.result?.tier || "FAIL";
  const ok = !!body.result?.ok;

  await db.codeAttempt.create({
    data: {
      userId: session.user.id,
      taskId: task.id,
      code: String(body.code || "").slice(0, 1000),
      tier,
      ok,
      diagnostics: body.result?.diagnostics || []
    }
  });

  if (ok) {
    await db.progress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } },
      update: { status: "DONE", points: lesson.points, doneAt: new Date() },
      create: { userId: session.user.id, lessonId: lesson.id, status: "DONE", points: lesson.points, doneAt: new Date() }
    });
    await db.user.update({ where: { id: session.user.id }, data: { points: { increment: lesson.points } } });
  }

  return NextResponse.json({ saved: true, ok });
}
