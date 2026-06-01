import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/api-key";

function unauthorized() {
  return NextResponse.json(
    { error: "Нужен заголовок Authorization: Bearer garp_..." },
    { status: 401 }
  );
}

export async function GET(request: Request) {
  const key = await authenticateApiKey(request);
  if (!key) return unauthorized();
  if (!key.scopes.includes("read:courses")) {
    return NextResponse.json({ error: "Нет scope read:courses" }, { status: 403 });
  }

  const courses = await db.course.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, simple: true, order: true, type: true, points: true }
          }
        }
      }
    }
  });

  return NextResponse.json({
    provider: "GARPIUM LMS",
    company: key.company.name,
    courses
  });
}
