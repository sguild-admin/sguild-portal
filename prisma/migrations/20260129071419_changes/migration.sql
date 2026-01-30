/*
  Warnings:

  - You are about to drop the column `endTime` on the `coach_availability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `coach_availability` table. All the data in the column will be lost.
  - The `role` column on the `member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `metadata` column on the `organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `endMin` to the `coach_availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startMin` to the `coach_availability` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `dayOfWeek` on the `coach_availability` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `invitation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('owner', 'admin', 'member');

-- CreateEnum
CREATE TYPE "InvitationRole" AS ENUM ('owner', 'admin', 'coach');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- DropIndex
DROP INDEX IF EXISTS "coach_availability_coachProfileId_idx";

-- DropIndex
DROP INDEX IF EXISTS "coach_profile_orgId_idx";

-- DropIndex
DROP INDEX IF EXISTS "member_organizationId_idx";

-- AlterTable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'coach_availability'
  ) THEN
    ALTER TABLE "coach_availability" DROP COLUMN "endTime",
    DROP COLUMN "startTime",
    ADD COLUMN     "endMin" INTEGER NOT NULL,
    ADD COLUMN     "startMin" INTEGER NOT NULL,
    DROP COLUMN "dayOfWeek",
    ADD COLUMN     "dayOfWeek" "Weekday" NOT NULL;
  END IF;
END $$;

-- AlterTable
ALTER TABLE "invitation" DROP COLUMN "role",
ADD COLUMN     "role" "InvitationRole" NOT NULL;

-- AlterTable
ALTER TABLE "member" ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "role",
ADD COLUMN     "role" "OrgRole" NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'coach_availability'
  ) THEN
    CREATE INDEX IF NOT EXISTS "coach_availability_coachProfileId_dayOfWeek_idx" ON "coach_availability"("coachProfileId", "dayOfWeek");
  END IF;
END $$;

-- CreateIndex
CREATE INDEX "coach_profile_orgId_status_idx" ON "coach_profile"("orgId", "status");

-- CreateIndex
CREATE INDEX "member_organizationId_role_status_idx" ON "member"("organizationId", "role", "status");

-- AddForeignKey
ALTER TABLE "coach_profile" ADD CONSTRAINT "coach_profile_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "member"("organizationId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;
