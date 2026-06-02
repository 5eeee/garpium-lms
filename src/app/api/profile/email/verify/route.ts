import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";
import { isOtpExpired, verifyOtp } from "@/lib/profile-otp";
import { profileGateCookie } from "@/lib/profile-gate";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const code = String(body?.code || "").trim();

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Введите 6-значный код." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: auth.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден." }, { status: 404 });
  }

  if (isOtpExpired(user.emailOtpExpires)) {
    return NextResponse.json({ error: "Код истёк. Запросите новое письмо." }, { status: 400 });
  }

  const valid = await verifyOtp(code, user.emailOtpHash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный код." }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.delete(profileGateCookie());

  if (user.pendingEmail) {
    await db.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        emailVerifiedAt: new Date(),
        pendingEmail: null,
        emailOtpHash: null,
        emailOtpExpires: null
      }
    });
    await writeAuditLog({
      userId: user.id,
      action: "PROFILE_EMAIL_CHANGED",
      description: `Email изменён на ${user.pendingEmail}`
    });
    return NextResponse.json({ ok: true, email: user.pendingEmail, reload: true });
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      emailOtpHash: null,
      emailOtpExpires: null
    }
  });

  return NextResponse.json({ ok: true, email: user.email });
}
