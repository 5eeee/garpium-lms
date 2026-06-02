import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireProfileUser } from "@/lib/api-profile";
import { db } from "@/lib/db";

/** Заглушка callback — полный обмен code→token подключается при выдаче ESIA_CLIENT_ID */
export async function GET(request: Request) {
  const auth = await requireProfileUser();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expected = cookieStore.get("esia_state")?.value;
  const scope = cookieStore.get("esia_scope")?.value || "user";

  if (!code || !state || state !== expected) {
    return NextResponse.redirect(new URL("/dashboard?esia=error#settings", request.url));
  }

  const subjectId = `esia-${code.slice(0, 24)}`;

  if (scope === "company" && auth.user.companyId) {
    await db.company.update({
      where: { id: auth.user.companyId },
      data: { esiaVerifiedAt: new Date(), esiaOrgId: subjectId }
    });
  } else {
    await db.user.update({
      where: { id: auth.user.id },
      data: { esiaSubjectId: subjectId, esiaVerifiedAt: new Date() }
    });
  }

  cookieStore.delete("esia_state");
  cookieStore.delete("esia_scope");

  return NextResponse.redirect(new URL("/dashboard?esia=ok#settings", request.url));
}
