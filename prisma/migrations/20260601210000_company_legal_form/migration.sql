DO $$ BEGIN
  CREATE TYPE "OrganizationLegalForm" AS ENUM (
    'SELF_EMPLOYED',
    'IP',
    'OOO',
    'AO',
    'PAO',
    'NKO',
    'GOVERNMENT'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "legalForm" "OrganizationLegalForm";
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "ogrn" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "kpp" TEXT;
