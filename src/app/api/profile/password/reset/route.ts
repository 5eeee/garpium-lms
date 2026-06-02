import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";
import { generateOtpCode, hashOtp, isOtpExpired, otpExpiresAt, verifyOtp } from "@/lib/profile-otp";
import { passwordResetCookie } from "@/lib/profile-gate";
import { sendPasswordResetEmail } from "@/lib/mail";
import { sendVerificationSms } from "@/lib/sms";

export async function POST(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const channel = body?.channel === "phone" ? "phone" : "email";

  if (channel === "email" && !auth.user.emailVerifiedAt) {
    return NextResponse.json({ error: "Сначала подтвердите email." }, { status: 400 });
  }

  if (channel === "phone" && !auth.user.phoneVerifiedAt) {
    return NextResponse.json({ error: "Сначала подтвердите телефон." }, { status: 400 });
  }

  const code = generateOtpCode();
  const passwordResetOtpHash = await hashOtp(code);

  await db.user.update({
    where: { id: auth.user.id },
    data: {
      passwordResetOtpHash,
      passwordResetOtpExpires: otpExpiresAt()
    }
  });

  try {
    if (channel === "phone" && auth.user.phone) {
      await sendVerificationSms(auth.user.phone, code);
    } else {
      await sendPasswordResetEmail(auth.user.email, code);
    }
  } catch {
    return NextResponse.json({ error: "Не удалось отправить код." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, channel });
}

export async function PUT(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const code = String(body?.code || "").trim();

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Введите 6-значный код." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: auth.user.id } });
  if (!user?.passwordResetOtpHash || isOtpExpired(user.passwordResetOtpExpires)) {
    return NextResponse.json({ error: "Код истёк. Запросите новый." }, { status: 400 });
  }

  const valid = await verifyOtp(code, user.passwordResetOtpHash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный код." }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(passwordResetCookie(), "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 900,
    path: "/"
  });

  await db.user.update({
    where: { id: user.id },
    data: { passwordResetOtpHash: null, passwordResetOtpExpires: null }
  });

  return NextResponse.json({ ok: true, redirect: "/change-password" });
}
