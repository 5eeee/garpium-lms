import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/api-key";

export async function GET(request: Request, context: { params: Promise<{ lessonId: string }> }) {
  const key = await authenticateApiKey(request);
  if (!key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!key.scopes.includes("read:lessons")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { lessonId } = await context.params;
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { tasks: true, module: { include: { course: true } } }
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json({ lesson, company: key.company.name });
}
