import { redirect } from "next/navigation";

export default async function CompanyLoginRedirect({
  searchParams
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const qs = params.mode === "register" ? "?mode=register" : "";
  redirect(`/login${qs}`);
}
