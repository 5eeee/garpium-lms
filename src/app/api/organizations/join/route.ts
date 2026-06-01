import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { joinByInviteSchema } from "@/lib/validators";
import { normalizeInviteCode } from "@/lib/invites";
import { writeAuditLog } from "@/lib/audit";

function inviteIsValid(invitation: {
  active: boolean;
  expiresAt: Date | null;
  maxUses: number | null;
  useCount: number;
  type: string;
}) {
  if (!invitation.active) return false;
  if (invitation.expiresAt && invitation.expiresAt < new Date()) return false;
  if (invitation.maxUses != null && invitation.useCount >= invitation.maxUses) return false;
  if (invitation.type === "SINGLE_USE" && invitation.useCount >= 1) return false;
  return true;
}

export async function POST(request: Request) {
  const session = await requireSession();
  const body = await request.json().catch(() => null);
  const parsed = joinByInviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите код приглашения." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "Пользователь не найден." }, { status: 404 });
  if (user.companyId) {
    return NextResponse.json({ error: "Вы уже состоите в организации." }, { status: 409 });
  }

  const code = normalizeInviteCode(parsed.data.code);
  const invitation = await db.invitation.findUnique({
    where: { code },
    include: { company: true, department: true }
  });

  if (!invitation || !inviteIsValid(invitation)) {
    return NextResponse.json({ error: "Приглашение недействительно или истекло." }, { status: 400 });
  }

  if (invitation.company.verificationStatus !== "VERIFIED") {
    return NextResponse.json(
      { error: "Организация ещё не прошла верификацию." },
      { status: 400 }
    );
  }

  const existing = await db.joinRequest.findFirst({
    where: { userId: user.id, companyId: invitation.companyId, status: "PENDING" }
  });

  if (existing) {
    return NextResponse.json({
      message: "Заявка уже отправлена. Ожидайте подтверждения администратора.",
      joinRequestId: existing.id
    });
  }

  const joinRequest = await db.$transaction(async (tx) => {
    const created = await tx.joinRequest.create({
      data: {
        userId: user.id,
        companyId: invitation.companyId,
        invitationId: invitation.id,
        departmentId: invitation.departmentId,
        jobTitle: invitation.jobTitle,
        status: "PENDING"
      }
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        useCount: { increment: 1 },
        active:
          invitation.type === "SINGLE_USE"
            ? false
            : invitation.maxUses != null && invitation.useCount + 1 >= invitation.maxUses
              ? false
              : invitation.active
      }
    });

    return created;
  });

  await writeAuditLog({
    userId: user.id,
    companyId: invitation.companyId,
    action: "join_request.invite",
    description: `Заявка на вступление по приглашению ${invitation.displayCode}`
  });

  return NextResponse.json({
    joinRequestId: joinRequest.id,
    company: { name: invitation.company.name },
    message: `Заявка отправлена в «${invitation.company.name}». Администратор подтвердит вступление.`
  });
}
