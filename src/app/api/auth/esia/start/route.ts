import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { requireProfileUser } from "@/lib/api-profile";
import { getEsiaAuthorizeUrl, getEsiaRedirectUri } from "@/lib/esia";
import { isEsiaDemoMode } from "@/lib/profile-otp";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const auth = await requireProfileUser();
  if ("error" in auth) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }
  const scope = url.searchParams.get("scope") || "user";
  const origin = url.origin;

  if (isEsiaDemoMode()) {
    return NextResponse.redirect(new URL(`/api/auth/esia/demo?scope=${scope}`, origin));
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("esia_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/"
  });
  cookieStore.set("esia_scope", scope, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/"
  });

  const redirectUri = getEsiaRedirectUri(origin);
  const authorize = getEsiaAuthorizeUrl(state, redirectUri);
  if (!authorize) {
    return NextResponse.json({ error: "ESIA не настроена." }, { status: 503 });
  }

  return NextResponse.redirect(authorize);
}
