-- AlterTable: OAuth users may not have password
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
