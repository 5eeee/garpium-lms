import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeInviteCode, formatInviteCode } from "@/lib/invites";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code: raw } = await context.params;
  const code = normalizeInviteCode(raw);

  const invitation = await db.invitation.findUnique({
    where: { code },
    include: {
      company: { select: { name: true, verificationStatus: true } },
      department: { select: { name: true } }
    }
  });

  if (!invitation || !invitation.active) {
    return NextResponse.json({ error: "Приглашение не найдено." }, { status: 404 });
  }

  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: "Срок действия приглашения истёк." }, { status: 410 });
  }

  return NextResponse.json({
    code: invitation.code,
    displayCode: invitation.displayCode || formatInviteCode(invitation.code),
    companyName: invitation.company.name,
    department: invitation.department?.name || null,
    jobTitle: invitation.jobTitle,
    assignRole: invitation.assignRole
  });
}
