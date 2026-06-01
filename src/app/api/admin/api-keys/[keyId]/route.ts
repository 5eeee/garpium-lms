import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminApiSession } from "@/lib/admin-api";

export async function DELETE(_: Request, context: { params: Promise<{ keyId: string }> }) {
  if (!(await getAdminApiSession())) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  const { keyId } = await context.params;
  await db.apiKey.update({
    where: { id: keyId },
    data: { active: false }
  });

  return NextResponse.json({ ok: true });
}
