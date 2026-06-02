import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";
import { generateOtpCode, hashOtp, otpExpiresAt } from "@/lib/profile-otp";
import { profileGateCookie } from "@/lib/profile-gate";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const useCurrent = body?.useCurrent === true;
  let email = useCurrent
    ? auth.user.email
    : String(body?.email || "")
        .toLowerCase()
        .trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Некорректный email." }, { status: 400 });
  }

  const isChange = !!auth.user.emailVerifiedAt && email !== auth.user.email;
  const isReverify = useCurrent && !auth.user.emailVerifiedAt;

  if ((isChange || (auth.user.emailVerifiedAt && !useCurrent)) && !isReverify) {
    const cookieStore = await cookies();
    if (cookieStore.get(profileGateCookie())?.value !== "1") {
      return NextResponse.json({ error: "Введите пароль для смены email." }, { status: 403 });
    }
  }

  if (!useCurrent) {
    const taken = await db.user.findFirst({
      where: { email, NOT: { id: auth.user.id } }
    });
    if (taken) {
      return NextResponse.json({ error: "Email уже используется." }, { status: 409 });
    }
  }

  const code = generateOtpCode();
  const emailOtpHash = await hashOtp(code);

  await db.user.update({
    where: { id: auth.user.id },
    data: {
      pendingEmail: useCurrent ? null : email,
      emailOtpHash,
      emailOtpExpires: otpExpiresAt()
    }
  });

  try {
    await sendVerificationEmail(email, code);
  } catch {
    return NextResponse.json({ error: "Не удалось отправить письмо." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message: "Письмо отправлено." });
}
