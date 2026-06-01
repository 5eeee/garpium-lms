import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { supportMessageSchema } from "@/lib/validators";
import { sendSms } from "@/lib/sms/provider";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Нужно войти." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = supportMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Заполните тему и сообщение." }, { status: 400 });
  }

  const thread = await db.supportThread.create({
    data: {
      userId: session.user.id,
      subject: parsed.data.subject,
      messages: {
        create: {
          userId: session.user.id,
          body: parsed.data.body
        }
      }
    },
    include: { messages: true }
  });

  await sendSms({
    to: "support",
    text: `Новый запрос поддержки: ${parsed.data.subject}`
  });

  return NextResponse.json({ thread });
}
