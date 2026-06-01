import { AuthScreen } from "@/components/AuthScreen";
import { listAvailableAuthProviders } from "@/lib/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ mode }, providers] = await Promise.all([searchParams, listAvailableAuthProviders()]);
  const initialMode = mode === "register" ? "register" : "login";

  return <AuthScreen initialMode={initialMode} providers={providers} />;
}
