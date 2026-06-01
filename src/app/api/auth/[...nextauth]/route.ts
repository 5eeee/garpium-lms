import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

async function auth(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const options = await getAuthOptions();
  const handler = NextAuth(options);
  return handler(req, context);
}

export { auth as GET, auth as POST };
