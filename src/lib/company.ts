import { db } from "@/lib/db";

export type CompanyBranding = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  showPoweredBy: boolean;
};

export async function getCompanyBySubdomain(subdomain: string): Promise<CompanyBranding | null> {
  const company = await db.company.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      showPoweredBy: true
    }
  });
  return company;
}
