import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const session = await requireAdmin();
  const { userId } = await context.params;
  const body = await request.json().catch(() => null);
  const status = body?.status === "APPROVED" ? "APPROVED" : body?.status === "REJECTED" ? "REJECTED" : null;

  if (!status) {
    return NextResponse.json({ error: "Нужен status APPROVED или REJECTED." }, { status: 400 });
  }

  const admin = await db.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true }
  });

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, companyId: true }
  });

  if (!target || !admin?.companyId || target.companyId !== admin.companyId) {
    return NextResponse.json({ error: "Нельзя изменить этого пользователя." }, { status: 403 });
  }

  const user = await db.user.update({
    where: { id: userId },
    data: {
      approvalStatus: status,
      approvedAt: status === "APPROVED" ? new Date() : null,
      approvedById: session.user.id
    },
    select: {
      id: true,
      email: true,
      approvalStatus: true
    }
  });

  return NextResponse.json({ user });
}
