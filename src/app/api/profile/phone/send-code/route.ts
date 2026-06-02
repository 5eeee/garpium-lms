import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";
import { generateOtpCode, hashOtp, normalizePhone, otpExpiresAt } from "@/lib/profile-otp";
import { profileGateCookie } from "@/lib/profile-gate";
import { sendVerificationSms } from "@/lib/sms";

export async function POST(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const phone = normalizePhone(String(body?.phone || ""));
  if (!phone) {
    return NextResponse.json({ error: "Укажите номер в формате +7XXXXXXXXXX." }, { status: 400 });
  }

  if (auth.user.phoneVerifiedAt) {
    const cookieStore = await cookies();
    if (cookieStore.get(profileGateCookie())?.value !== "1") {
      return NextResponse.json({ error: "Введите пароль для смены номера." }, { status: 403 });
    }
  }

  const taken = await db.user.findFirst({
    where: { phone, NOT: { id: auth.user.id } }
  });
  if (taken) {
    return NextResponse.json({ error: "Этот номер уже привязан." }, { status: 409 });
  }

  const code = generateOtpCode();
  const phoneOtpHash = await hashOtp(code);

  await db.user.update({
    where: { id: auth.user.id },
    data: {
      phone,
      phoneVerifiedAt: null,
      phoneOtpHash,
      phoneOtpExpires: otpExpiresAt()
    }
  });

  try {
    await sendVerificationSms(phone, code);
  } catch {
    return NextResponse.json({ error: "Не удалось отправить SMS." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message: "SMS отправлено." });
}
