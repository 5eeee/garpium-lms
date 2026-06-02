import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureProfileSchema } from "@/lib/ensure-profile-schema";

export async function requireProfileUser() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Требуется авторизация." }, { status: 401 }) };
  }

  await ensureProfileSchema();

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return { error: NextResponse.json({ error: "Пользователь не найден." }, { status: 404 }) };
  }

  return { user };
}
