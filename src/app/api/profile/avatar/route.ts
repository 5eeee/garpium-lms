import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const file = form.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Выберите файл изображения." }, { status: 400 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Допустимы JPEG, PNG или WebP." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Максимальный размер — 2 МБ." }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });

  const filename = `${auth.user.id}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const avatarUrl = `/uploads/avatars/${filename}?v=${Date.now()}`;
  await db.user.update({
    where: { id: auth.user.id },
    data: { avatarUrl }
  });

  return NextResponse.json({ ok: true, avatarUrl });
}

export async function DELETE() {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  await db.user.update({
    where: { id: auth.user.id },
    data: { avatarUrl: null }
  });

  return NextResponse.json({ ok: true });
}
