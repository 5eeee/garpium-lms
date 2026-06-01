import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { extractEmailDomain } from "@/lib/invites";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте имя, email и пароль." }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Пользователь с таким email уже есть." }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      passwordHash: await hash(parsed.data.password, 12),
      role: "PUBLIC_USER",
      approvalStatus: "APPROVED"
    },
    select: {
      id: true,
      email: true,
      approvalStatus: true
    }
  });

  await writeAuditLog({
    userId: user.id,
    action: "user.register",
    description: `Регистрация пользователя ${user.email}`
  });

  const domain = extractEmailDomain(parsed.data.email);
  let domainHint: { companyName: string; companyId: string } | null = null;

  if (domain) {
    const orgDomain = await db.organizationDomain.findFirst({
      where: { domain, verified: true },
      include: { company: true }
    });

    if (orgDomain?.company.verificationStatus === "VERIFIED") {
      const pendingJoin = await db.joinRequest.findFirst({
        where: { userId: user.id, companyId: orgDomain.companyId, status: "PENDING" }
      });

      if (!pendingJoin) {
        await db.joinRequest.create({
          data: {
            userId: user.id,
            companyId: orgDomain.companyId,
            jobTitle: null,
            status: "PENDING"
          }
        });

        await writeAuditLog({
          userId: user.id,
          companyId: orgDomain.companyId,
          action: "join_request.domain",
          description: `Заявка на вступление по домену ${domain}`
        });
      }

      domainHint = { companyName: orgDomain.company.name, companyId: orgDomain.companyId };
    }
  }

  return NextResponse.json({
    user,
    domainHint,
    message: domainHint
      ? `Аккаунт создан. Мы предложили присоединиться к «${domainHint.companyName}» — администратор подтвердит заявку.`
      : "Аккаунт создан. Войдите и откройте раздел «Моя компания», чтобы создать организацию или принять приглашение."
  });
}
