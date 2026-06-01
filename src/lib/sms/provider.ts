export type SmsPayload = {
  to: string;
  text: string;
};

export async function sendSms(payload: SmsPayload) {
  if (process.env.SMS_PROVIDER === "mock" || !process.env.SMS_PROVIDER) {
    console.info("[sms:mock]", payload.to, payload.text);
    return { ok: true, provider: "mock" };
  }

  // Реального провайдера подключаем здесь: sms.ru, Twilio, Vonage или корпоративный шлюз.
  // Интерфейс выше уже стабилен, LMS не придётся переписывать.
  return { ok: false, provider: process.env.SMS_PROVIDER, error: "Provider is not configured" };
}
