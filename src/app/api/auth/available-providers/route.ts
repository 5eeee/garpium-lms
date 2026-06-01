import { NextResponse } from "next/server";
import { listAvailableAuthProviders } from "@/lib/auth";

export async function GET() {
  try {
    const providers = await listAvailableAuthProviders();
    return NextResponse.json({ providers });
  } catch (error) {
    console.error("[auth/providers]", error);
    return NextResponse.json({ providers: [], error: "Auth providers unavailable" }, { status: 500 });
  }
}
