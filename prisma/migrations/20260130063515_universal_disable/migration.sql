/*
  Warnings:

  - You are about to drop the column `orgId` on the `coach_profile` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `coach_profile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `coach_profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberId]` on the table `coach_profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `memberId` to the `coach_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "InvitationRole" ADD VALUE 'member';

-- AlterEnum
ALTER TYPE "OrgRole" ADD VALUE 'coach';

-- DropForeignKey
ALTER TABLE "coach_profile" DROP CONSTRAINT "coach_profile_orgId_fkey";

-- DropForeignKey
ALTER TABLE "coach_profile" DROP CONSTRAINT "coach_profile_orgId_userId_fkey";

-- DropForeignKey
ALTER TABLE "coach_profile" DROP CONSTRAINT "coach_profile_userId_fkey";

-- DropIndex
DROP INDEX "coach_profile_orgId_status_idx";

-- DropIndex
DROP INDEX "coach_profile_orgId_userId_key";

-- DropIndex
DROP INDEX "coach_profile_userId_idx";

-- AlterTable
ALTER TABLE "coach_profile" DROP COLUMN "orgId",
DROP COLUMN "status",
DROP COLUMN "userId",
ADD COLUMN     "memberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "member" ADD COLUMN     "disabledAt" TIMESTAMP(3),
ADD COLUMN     "disabledReason" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropEnum
DROP TYPE "CoachStatus";

-- CreateIndex
CREATE UNIQUE INDEX "coach_profile_memberId_key" ON "coach_profile"("memberId");

-- AddForeignKey
ALTER TABLE "coach_profile" ADD CONSTRAINT "coach_profile_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
