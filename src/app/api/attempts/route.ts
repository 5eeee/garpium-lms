import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getApprovedApiSession } from "@/lib/api-session";
import { checkCode } from "@/lib/code-checker/checker";

const schema = z.object({
  taskId: z.string().min(1),
  code: z.string().max(1000)
});

export async function POST(request: Request) {
  const session = await getApprovedApiSession();
  if (!session) {
    return NextResponse.json({ error: "Нужен одобренный аккаунт." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте код задания." }, { status: 400 });
  }

  const task = await db.task.findUnique({
    where: { id: parsed.data.taskId },
    include: { lesson: true }
  });
  if (!task) return NextResponse.json({ error: "Задание не найдено." }, { status: 404 });

  const result = checkCode(parsed.data.code, {
    type: task.type === "CSS" ? "css" : "html",
    primary: task.primary,
    acceptable: task.acceptable,
    wrongHints: Array.isArray(task.wrongHints) ? task.wrongHints as { pattern: string; msg: string }[] : []
  });

  const userId = session.user.id!;
  const existingProgress = await db.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId: task.lessonId } }
  });
  const firstDone = result.ok && existingProgress?.status !== "DONE";

  const [attempt, progress] = await db.$transaction([
    db.codeAttempt.create({
      data: {
        userId,
        taskId: task.id,
        code: parsed.data.code,
        tier: result.tier,
        ok: result.ok,
        diagnostics: result.diagnostics as object
      }
    }),
    db.progress.upsert({
      where: { userId_lessonId: { userId, lessonId: task.lessonId } },
      update: {
        status: result.ok ? "DONE" : "IN_PROGRESS",
        points: result.ok ? task.lesson.points : existingProgress?.points ?? 0,
        doneAt: result.ok ? new Date() : existingProgress?.doneAt
      },
      create: {
        userId,
        lessonId: task.lessonId,
        status: result.ok ? "DONE" : "IN_PROGRESS",
        points: result.ok ? task.lesson.points : 0,
        doneAt: result.ok ? new Date() : null
      }
    }),
    ...(firstDone
      ? [
          db.user.update({
            where: { id: userId },
            data: { points: { increment: task.lesson.points } }
          })
        ]
      : [])
  ]);

  return NextResponse.json({ attempt, progress, result });
}
