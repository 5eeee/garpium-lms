/** Отправка письма: SMTP через API или лог в demo-режиме */

export async function sendVerificationEmail(to: string, code: string) {
  const subject = "Код подтверждения — GARPIUM LMS";
  const text = `Ваш код подтверждения: ${code}\n\nКод действителен 10 минут.\n\nGARPIUM LMS`;

  const webhook = process.env.EMAIL_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, text, code })
    });
    if (!res.ok) throw new Error("Email webhook failed");
    return;
  }

  const host = process.env.SMTP_HOST;
  if (host && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.info(`[email SMTP configured] ${to} — настройте EMAIL_WEBHOOK_URL для отправки`);
    return;
  }

  console.info(`[email] ${to} → код ${code}`);
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const origin = process.env.NEXTAUTH_URL || "https://lms.garpium.com";
  const subject = "Смена пароля — GARPIUM LMS";
  const text = `Код для смены пароля: ${code}\n\nПосле ввода кода откройте: ${origin}/change-password\n\nGARPIUM LMS`;

  const webhook = process.env.EMAIL_WEBHOOK_URL;
  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, text, code })
    });
    return;
  }

  console.info(`[email reset] ${to} → код ${code}`);
}
