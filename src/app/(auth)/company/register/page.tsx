import { redirect } from "next/navigation";

export default function CompanyRegisterRedirect() {
  redirect("/login?mode=register");
}
