import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const garpium = await prisma.company.upsert({
    where: { slug: "garpium" },
    update: {
      name: "GARPIUM",
      website: "https://garpium.com",
      subdomain: "lms",
      logoUrl: "/garpium-logo.png",
      showPoweredBy: true,
      verificationStatus: "VERIFIED",
      isGarpium: true
    },
    create: {
      name: "GARPIUM",
      slug: "garpium",
      website: "https://garpium.com",
      subdomain: "lms",
      logoUrl: "/garpium-logo.png",
      showPoweredBy: true,
      verificationStatus: "VERIFIED",
      isGarpium: true
    }
  });

  const company = await prisma.company.upsert({
    where: { slug: "default" },
    update: {},
    create: { name: "Corporate LMS", slug: "default" }
  });

  await prisma.user.upsert({
    where: { email: "superadmin@garpium.com" },
    update: { role: "SUPER_ADMIN", approvalStatus: "APPROVED" },
    create: {
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@garpium.com",
      passwordHash: await hash("superadmin12345", 12),
      role: "SUPER_ADMIN",
      approvalStatus: "APPROVED"
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { companyId: garpium.id, role: "COMPANY_OWNER" },
    create: {
      firstName: "Admin",
      lastName: "GARPIUM",
      email: "admin@example.com",
      passwordHash: await hash("admin12345", 12),
      role: "COMPANY_OWNER",
      approvalStatus: "APPROVED",
      companyId: garpium.id
    }
  });

  await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: { approvalStatus: "APPROVED", companyId: garpium.id, role: "COMPANY_EMPLOYEE" },
    create: {
      firstName: "Ученик",
      lastName: "Демо",
      email: "student@example.com",
      passwordHash: await hash("student12345", 12),
      role: "COMPANY_EMPLOYEE",
      approvalStatus: "APPROVED",
      companyId: garpium.id
    }
  });

  const pendingOrgOwner = await prisma.user.upsert({
    where: { email: "pending-org@example.com" },
    update: { role: "COMPANY_OWNER", approvalStatus: "APPROVED" },
    create: {
      firstName: "Демо",
      lastName: "Заявка",
      email: "pending-org@example.com",
      passwordHash: await hash("pendingorg12345", 12),
      role: "COMPANY_OWNER",
      approvalStatus: "APPROVED"
    }
  });

  const pendingCompany = await prisma.company.upsert({
    where: { slug: "demo-pending" },
    update: {
      name: "Demo Pending Corp",
      verificationStatus: "PENDING_VERIFICATION",
      ownerId: pendingOrgOwner.id,
      inn: "7707083893",
      legalName: "ООО «Демо Ожидание»",
      legalAddress: "г. Москва, ул. Примерная, 1",
      corporateEmail: "legal@demo-pending.example"
    },
    create: {
      name: "Demo Pending Corp",
      slug: "demo-pending",
      verificationStatus: "PENDING_VERIFICATION",
      ownerId: pendingOrgOwner.id,
      inn: "7707083893",
      legalName: "ООО «Демо Ожидание»",
      legalAddress: "г. Москва, ул. Примерная, 1",
      corporateEmail: "legal@demo-pending.example"
    }
  });

  await prisma.user.update({
    where: { id: pendingOrgOwner.id },
    data: { companyId: pendingCompany.id }
  });

  await prisma.organizationMember.upsert({
    where: { userId_companyId: { userId: pendingOrgOwner.id, companyId: pendingCompany.id } },
    update: { orgRole: "COMPANY_OWNER", status: "PENDING" },
    create: {
      userId: pendingOrgOwner.id,
      companyId: pendingCompany.id,
      orgRole: "COMPANY_OWNER",
      status: "PENDING"
    }
  });

  await prisma.user.upsert({
    where: { email: "pending@example.com" },
    update: { companyId: garpium.id, role: "COMPANY_EMPLOYEE" },
    create: {
      firstName: "Ожидание",
      lastName: "Демо",
      email: "pending@example.com",
      passwordHash: await hash("pending12345", 12),
      role: "COMPANY_EMPLOYEE",
      approvalStatus: "PENDING",
      companyId: garpium.id
    }
  });

  const seededUsers = await prisma.user.findMany({
    where: { email: { in: ["admin@example.com", "student@example.com", "pending@example.com"] } }
  });

  for (const user of seededUsers) {
    if (!user.companyId) continue;
    const orgRole =
      user.role === "COMPANY_OWNER" || user.role === "COMPANY_ADMIN"
        ? "COMPANY_ADMIN"
        : user.role === "COMPANY_MANAGER"
          ? "COMPANY_MANAGER"
          : "COMPANY_EMPLOYEE";

    await prisma.organizationMember.upsert({
      where: { userId_companyId: { userId: user.id, companyId: user.companyId } },
      update: { orgRole, status: user.approvalStatus === "APPROVED" ? "ACTIVE" : "PENDING" },
      create: {
        userId: user.id,
        companyId: user.companyId,
        orgRole,
        status: user.approvalStatus === "APPROVED" ? "ACTIVE" : "PENDING"
      }
    });
  }

  await prisma.company.update({
    where: { id: garpium.id },
    data: {
      verificationStatus: "VERIFIED",
      isGarpium: true,
      ownerId: (await prisma.user.findUnique({ where: { email: "admin@example.com" } }))?.id
    }
  });

}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
