import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateApiKey, hashApiKey } from "@/lib/api-key";
import { getAdminApiSession } from "@/lib/admin-api";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  companyId: z.string().optional(),
  scopes: z.array(z.string()).optional()
});

export async function GET() {
  if (!(await getAdminApiSession())) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  const keys = await db.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: true }
  });

  return NextResponse.json({
    keys: keys.map((item) => ({
      id: item.id,
      name: item.name,
      prefix: item.prefix,
      scopes: item.scopes,
      active: item.active,
      company: item.company.name,
      createdAt: item.createdAt,
      lastUsedAt: item.lastUsedAt
    }))
  });
}

export async function POST(request: Request) {
  const session = await getAdminApiSession();
  if (!session) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите название ключа." }, { status: 400 });
  }

  const company =
    parsed.data.companyId
      ? await db.company.findUnique({ where: { id: parsed.data.companyId } })
      : await db.company.findFirst({ where: { slug: "garpium" } });

  if (!company) {
    return NextResponse.json({ error: "Компания не найдена." }, { status: 404 });
  }

  const { raw, prefix } = generateApiKey();
  const keyHash = await hashApiKey(raw);

  const apiKey = await db.apiKey.create({
    data: {
      companyId: company.id,
      name: parsed.data.name,
      prefix,
      keyHash,
      scopes: parsed.data.scopes || ["read:courses", "read:lessons", "read:progress", "manage:users"]
    }
  });

  return NextResponse.json({
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      scopes: apiKey.scopes,
      company: company.name
    },
    secret: raw,
    message: "Сохраните ключ сейчас - он больше не будет показан."
  });
}
