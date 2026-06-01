-- Multi-tenant platform foundation

-- New enums
CREATE TYPE "OrganizationVerificationStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');
CREATE TYPE "OrganizationRole" AS ENUM ('COMPANY_OWNER', 'COMPANY_ADMIN', 'COMPANY_MANAGER', 'COMPANY_EMPLOYEE');
CREATE TYPE "InvitationType" AS ENUM ('SINGLE_USE', 'MULTI_USE');
CREATE TYPE "DepartmentType" AS ENUM ('DEPARTMENT', 'DIVISION', 'GROUP', 'TEAM', 'BRANCH');

-- Extend Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GARPIUM_EMPLOYEE';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COMPANY_OWNER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COMPANY_ADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COMPANY_MANAGER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COMPANY_EMPLOYEE';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PUBLIC_USER';

-- Migrate legacy roles
UPDATE "User" SET role = 'COMPANY_ADMIN' WHERE role = 'ADMIN';
UPDATE "User" SET role = 'COMPANY_EMPLOYEE' WHERE role = 'STUDENT' AND "companyId" IS NOT NULL;
UPDATE "User" SET role = 'PUBLIC_USER' WHERE role = 'STUDENT' AND "companyId" IS NULL;

-- Company verification fields
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "verificationStatus" "OrganizationVerificationStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION';
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "inn" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "legalName" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "legalAddress" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "corporateEmail" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "additionalInfo" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "isGarpium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

-- Mark existing companies as verified (backward compat)
UPDATE "Company" SET "verificationStatus" = 'VERIFIED' WHERE "verificationStatus" = 'PENDING_VERIFICATION';
UPDATE "Company" SET "isGarpium" = true WHERE slug = 'garpium';

-- ApiKey secret
ALTER TABLE "ApiKey" ADD COLUMN IF NOT EXISTS "secretHash" TEXT;

-- OrganizationMember
CREATE TABLE IF NOT EXISTS "OrganizationMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "orgRole" "OrganizationRole" NOT NULL DEFAULT 'COMPANY_EMPLOYEE',
    "departmentId" TEXT,
    "jobTitle" TEXT,
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationMember_userId_companyId_key" ON "OrganizationMember"("userId", "companyId");

-- Department (before FK refs)
CREATE TABLE IF NOT EXISTS "Department" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DepartmentType" NOT NULL DEFAULT 'DEPARTMENT',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- Invitation
CREATE TABLE IF NOT EXISTS "Invitation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayCode" TEXT NOT NULL,
    "type" "InvitationType" NOT NULL DEFAULT 'SINGLE_USE',
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "departmentId" TEXT,
    "jobTitle" TEXT,
    "assignRole" "OrganizationRole" NOT NULL DEFAULT 'COMPANY_EMPLOYEE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_code_key" ON "Invitation"("code");

-- JoinRequest
CREATE TABLE IF NOT EXISTS "JoinRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invitationId" TEXT,
    "departmentId" TEXT,
    "jobTitle" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- OrganizationDomain
CREATE TABLE IF NOT EXISTS "OrganizationDomain" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationDomain_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationDomain_domain_key" ON "OrganizationDomain"("domain");

-- AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrganizationDomain" ADD CONSTRAINT "OrganizationDomain_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill organization members from existing users
INSERT INTO "OrganizationMember" ("id", "userId", "companyId", "orgRole", "status", "joinedAt")
SELECT
  'mem_' || u."id",
  u."id",
  u."companyId",
  CASE
    WHEN u.role IN ('COMPANY_OWNER', 'COMPANY_ADMIN') THEN 'COMPANY_ADMIN'::"OrganizationRole"
    WHEN u.role = 'COMPANY_MANAGER' THEN 'COMPANY_MANAGER'::"OrganizationRole"
    ELSE 'COMPANY_EMPLOYEE'::"OrganizationRole"
  END,
  CASE WHEN u."approvalStatus" = 'APPROVED' THEN 'ACTIVE'::"MembershipStatus" ELSE 'PENDING'::"MembershipStatus" END,
  u."createdAt"
FROM "User" u
WHERE u."companyId" IS NOT NULL
ON CONFLICT ("userId", "companyId") DO NOTHING;

UPDATE "Company" c
SET "ownerId" = u."id"
FROM "User" u
WHERE u."companyId" = c."id" AND u.role IN ('COMPANY_OWNER', 'COMPANY_ADMIN')
AND c."ownerId" IS NULL;
