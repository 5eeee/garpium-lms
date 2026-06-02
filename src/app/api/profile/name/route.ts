import { NextResponse } from "next/server";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const middleNameRaw = body?.middleName;
  const middleName =
    middleNameRaw === null || middleNameRaw === undefined
      ? undefined
      : String(middleNameRaw).trim() || null;

  if (firstName.length < 1 || lastName.length < 1) {
    return NextResponse.json({ error: "Укажите имя и фамилию." }, { status: 400 });
  }

  await db.user.update({
    where: { id: auth.user.id },
    data: {
      firstName,
      lastName,
      ...(middleName !== undefined ? { middleName } : {})
    }
  });

  return NextResponse.json({ ok: true, firstName, lastName, middleName: middleName ?? null });
}
