export async function sendVerificationSms(phone: string, code: string) {
  const webhook = process.env.SMS_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, text: `GARPIUM LMS: ${code}`, code })
    });
    if (!res.ok) throw new Error("SMS webhook failed");
    return;
  }

  console.info(`[sms] ${phone} → код ${code}`);
}
