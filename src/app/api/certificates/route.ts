import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getApprovedApiSession } from "@/lib/api-session";

export async function POST() {
  const session = await getApprovedApiSession();
  if (!session) {
    return NextResponse.json({ error: "Нужен одобренный аккаунт." }, { status: 401 });
  }

  const userId = session.user.id!;

  const [htmlDone, cssDone, existing] = await Promise.all([
    db.progress.count({ where: { userId, status: "DONE", lessonId: { startsWith: "h-" } } }),
    db.progress.count({ where: { userId, status: "DONE", lessonId: { startsWith: "c-" } } }),
    db.certificate.findFirst({ where: { userId, status: "ISSUED" } })
  ]);

  if (existing) {
    return NextResponse.json({ certificate: existing });
  }

  if (htmlDone < 60 || cssDone < 60) {
    return NextResponse.json({ error: "Нужно пройти все 120 уроков." }, { status: 400 });
  }

  const certificate = await db.certificate.create({
    data: {
      userId,
      status: "ISSUED",
      issuedAt: new Date(),
      number: `CERT-${Date.now()}-${userId.slice(0, 8)}`
    }
  });

  return NextResponse.json({ certificate });
}
