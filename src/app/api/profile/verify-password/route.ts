import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { requireProfileUser } from "@/lib/api-profile";
import { profileGateCookie } from "@/lib/profile-gate";

export async function POST(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const password = String(body?.password || "");

  if (!auth.user.passwordHash) {
    return NextResponse.json(
      { error: "У аккаунта нет пароля. Войдите через email или задайте пароль." },
      { status: 400 }
    );
  }

  const valid = await compare(password, auth.user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный пароль." }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set(profileGateCookie(), "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/"
  });

  return NextResponse.json({ ok: true });
}
