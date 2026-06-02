import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hash } from "bcryptjs";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";
import { passwordResetCookie } from "@/lib/profile-gate";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const cookieStore = await cookies();
  if (cookieStore.get(passwordResetCookie())?.value !== "1") {
    return NextResponse.json({ error: "Сначала подтвердите код из письма или SMS." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const password = String(body?.password || "");
  const confirm = String(body?.confirm || "");

  if (password.length < 8) {
    return NextResponse.json({ error: "Пароль не менее 8 символов." }, { status: 400 });
  }

  if (password !== confirm) {
    return NextResponse.json({ error: "Пароли не совпадают." }, { status: 400 });
  }

  await db.user.update({
    where: { id: auth.user.id },
    data: {
      passwordHash: await hash(password, 12),
      passwordResetOtpHash: null,
      passwordResetOtpExpires: null
    }
  });

  cookieStore.delete(passwordResetCookie());

  await writeAuditLog({
    userId: auth.user.id,
    action: "PASSWORD_CHANGED",
    description: "Пароль изменён"
  });

  return NextResponse.json({ ok: true });
}
