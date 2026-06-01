import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminApiSession } from "@/lib/admin-api";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  simple: z.string().min(1).max(2000).optional(),
  theory: z.string().max(5000).optional(),
  order: z.number().int().min(1).max(999).optional(),
  points: z.number().int().min(0).max(1000).optional(),
  visualType: z.string().max(40).optional(),
  task: z
    .object({
      label: z.string().max(200).optional(),
      starter: z.string().max(2000).optional(),
      preview: z.string().max(2000).optional(),
      primary: z.array(z.string()).optional(),
      acceptable: z.array(z.string()).optional()
    })
    .optional()
});

export async function GET(_: Request, context: { params: Promise<{ lessonId: string }> }) {
  if (!(await getAdminApiSession())) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const { lessonId } = await context.params;
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { tasks: true, module: { include: { course: true } } }
  });
  if (!lesson) return NextResponse.json({ error: "Урок не найден." }, { status: 404 });
  return NextResponse.json({ lesson });
}

export async function PATCH(request: Request, context: { params: Promise<{ lessonId: string }> }) {
  if (!(await getAdminApiSession())) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const { lessonId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте поля формы." }, { status: 400 });
  }

  const existing = await db.lesson.findUnique({ where: { id: lessonId }, include: { tasks: true } });
  if (!existing) return NextResponse.json({ error: "Урок не найден." }, { status: 404 });

  const content = existing.content as Record<string, unknown>;
  if (parsed.data.theory !== undefined) content.theory = parsed.data.theory;
  if (parsed.data.simple !== undefined) content.simple = parsed.data.simple;

  const visual = (existing.visual as Record<string, unknown>) || {};
  if (parsed.data.visualType) visual.type = parsed.data.visualType;

  await db.lesson.update({
    where: { id: lessonId },
    data: {
      title: parsed.data.title,
      simple: parsed.data.simple,
      order: parsed.data.order,
      points: parsed.data.points,
      content: content as object,
      visual: visual as object
    }
  });

  if (parsed.data.task && existing.tasks[0]) {
    await db.task.update({
      where: { id: existing.tasks[0].id },
      data: {
        label: parsed.data.task.label,
        starter: parsed.data.task.starter,
        preview: parsed.data.task.preview,
        primary: parsed.data.task.primary,
        acceptable: parsed.data.task.acceptable
      }
    });
  }

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { tasks: true, module: { include: { course: true } } }
  });

  return NextResponse.json({ lesson, message: "Урок сохранён." });
}
