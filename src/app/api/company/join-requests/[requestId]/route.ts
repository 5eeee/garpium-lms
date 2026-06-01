import { NextResponse } from "next/server";
import type { OrganizationRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireCompanyAdmin } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  const session = await requireCompanyAdmin();
  const { requestId } = await context.params;
  const body = await request.json().catch(() => null);
  const status = body?.status === "APPROVED" ? "APPROVED" : body?.status === "REJECTED" ? "REJECTED" : null;

  if (!status) {
    return NextResponse.json({ error: "Нужен status APPROVED или REJECTED." }, { status: 400 });
  }

  const admin = await db.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, companyId: true }
  });

  const joinRequest = await db.joinRequest.findUnique({
    where: { id: requestId },
    include: { user: true, invitation: true }
  });

  if (!joinRequest || !admin?.companyId || joinRequest.companyId !== admin.companyId) {
    return NextResponse.json({ error: "Заявка не найдена." }, { status: 404 });
  }

  if (joinRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Заявка уже обработана." }, { status: 409 });
  }

  if (status === "APPROVED") {
    const assignRole = (joinRequest.invitation?.assignRole || "COMPANY_EMPLOYEE") as OrganizationRole;
    const userRole = assignRole as "COMPANY_EMPLOYEE" | "COMPANY_MANAGER" | "COMPANY_ADMIN" | "COMPANY_OWNER";

    await db.$transaction(async (tx) => {
      await tx.joinRequest.update({
        where: { id: joinRequest.id },
        data: {
          status: "APPROVED",
          reviewedById: admin.id,
          reviewedAt: new Date()
        }
      });

      await tx.user.update({
        where: { id: joinRequest.userId },
        data: {
          companyId: joinRequest.companyId,
          role: userRole,
          approvalStatus: "APPROVED",
          approvedAt: new Date(),
          approvedById: admin.id
        }
      });

      await tx.organizationMember.upsert({
        where: {
          userId_companyId: { userId: joinRequest.userId, companyId: joinRequest.companyId }
        },
        create: {
          userId: joinRequest.userId,
          companyId: joinRequest.companyId,
          orgRole: assignRole,
          departmentId: joinRequest.departmentId,
          jobTitle: joinRequest.jobTitle,
          status: "ACTIVE"
        },
        update: {
          orgRole: assignRole,
          departmentId: joinRequest.departmentId,
          jobTitle: joinRequest.jobTitle,
          status: "ACTIVE"
        }
      });
    });

    await writeAuditLog({
      userId: admin.id,
      companyId: admin.companyId,
      action: "join_request.approve",
      description: `Одобрено вступление ${joinRequest.user.email}`
    });
  } else {
    await db.joinRequest.update({
      where: { id: joinRequest.id },
      data: {
        status: "REJECTED",
        reviewedById: admin.id,
        reviewedAt: new Date()
      }
    });

    await writeAuditLog({
      userId: admin.id,
      companyId: admin.companyId,
      action: "join_request.reject",
      description: `Отклонено вступление ${joinRequest.user.email}`
    });
  }

  return NextResponse.json({ ok: true, status });
}
