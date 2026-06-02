-- Combined profile migrations (safe to re-run)
-- Run on production: psql -U lms -d corporate_lms -f this-file.sql

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pendingEmail" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneOtpHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneOtpExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailOtpHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailOtpExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "esiaSubjectId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "esiaVerifiedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX IF NOT EXISTS "User_esiaSubjectId_key" ON "User"("esiaSubjectId");

ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "esiaVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "esiaOrgId" TEXT;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetOtpHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetOtpExpires" TIMESTAMP(3);
