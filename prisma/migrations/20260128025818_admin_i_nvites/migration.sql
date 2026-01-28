/*
  Warnings:

  - You are about to drop the column `status` on the `invitation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "invitation_organizationId_email_role_status_key";

-- AlterTable
ALTER TABLE "invitation" DROP COLUMN "status",
ADD COLUMN     "lastSentAt" TIMESTAMP(3),
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "tokenLast4" TEXT;

-- CreateIndex
CREATE INDEX "invitation_organizationId_email_idx" ON "invitation"("organizationId", "email");
