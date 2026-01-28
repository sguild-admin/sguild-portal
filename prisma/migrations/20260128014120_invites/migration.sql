/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,email,role,status]` on the table `invitation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,userId]` on the table `member` will be added. If there are existing duplicate values, this will fail.
  - Made the column `role` on table `invitation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "invitation" ALTER COLUMN "role" SET NOT NULL;

-- AlterTable
ALTER TABLE "member" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "invitation_organizationId_email_role_status_key" ON "invitation"("organizationId", "email", "role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "member_organizationId_userId_key" ON "member"("organizationId", "userId");
