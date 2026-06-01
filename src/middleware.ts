import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  let subdomain: string | null = null;
  if (parts.length >= 3 && parts[0] !== "www") {
    subdomain = parts[0];
  }

  const response = NextResponse.next();
  if (subdomain) {
    response.headers.set("x-company-subdomain", subdomain);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
