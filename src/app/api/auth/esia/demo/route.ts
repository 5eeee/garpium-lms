import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

/** Демо-режим Госуслуг (пока нет ESIA_CLIENT_ID в production) */
export async function GET(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") || "user";
  const subjectId = `demo-esia-${auth.user.id}`;

  if (scope === "company" && auth.user.companyId) {
    await db.company.update({
      where: { id: auth.user.companyId },
      data: {
        esiaVerifiedAt: new Date(),
        esiaOrgId: subjectId
      }
    });
    await writeAuditLog({
      userId: auth.user.id,
      action: "COMPANY_ESIA_DEMO",
      description: "Демо-верификация организации через Госуслуги"
    });
  } else {
    await db.user.update({
      where: { id: auth.user.id },
      data: {
        esiaSubjectId: subjectId,
        esiaVerifiedAt: new Date()
      }
    });
    await writeAuditLog({
      userId: auth.user.id,
      action: "USER_ESIA_DEMO",
      description: "Демо-верификация личности через Госуслуги"
    });
  }

  const cookieStore = await cookies();
  cookieStore.delete("esia_state");
  cookieStore.delete("esia_scope");

  return NextResponse.redirect(new URL("/dashboard?esia=ok#settings", request.url));
}
