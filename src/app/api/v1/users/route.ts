import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticateApiKey } from "@/lib/api-key";

const schema = z.object({
  firstName: z.string().min(1).max(40),
  lastName: z.string().min(1).max(40),
  email: z.string().email().max(80),
  password: z.string().min(8).max(72)
});

export async function POST(request: Request) {
  const key = await authenticateApiKey(request);
  if (!key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!key.scopes.includes("manage:users")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "User exists" }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hash(parsed.data.password, 12),
      companyId: key.companyId,
      approvalStatus: "APPROVED",
      approvedAt: new Date()
    },
    select: { id: true, email: true, firstName: true, lastName: true, approvalStatus: true }
  });

  return NextResponse.json({ user, company: key.company.name });
}
