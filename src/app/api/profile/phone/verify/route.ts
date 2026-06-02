import { NextResponse } from "next/server";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";
import { isOtpExpired, verifyOtp } from "@/lib/profile-otp";
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
  if (!user?.phone) {
    return NextResponse.json({ error: "Сначала укажите номер телефона." }, { status: 400 });
  }

  if (isOtpExpired(user.phoneOtpExpires)) {
    return NextResponse.json({ error: "Код истёк. Запросите новый." }, { status: 400 });
  }

  const valid = await verifyOtp(code, user.phoneOtpHash);
  if (!valid) {
    return NextResponse.json({ error: "Неверный код." }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      phoneVerifiedAt: new Date(),
      phoneOtpHash: null,
      phoneOtpExpires: null
    }
  });

  await writeAuditLog({
    userId: user.id,
    action: "PROFILE_PHONE_VERIFIED",
    description: "Подтверждён номер телефона"
  });

  return NextResponse.json({ ok: true, phone: user.phone });
}
