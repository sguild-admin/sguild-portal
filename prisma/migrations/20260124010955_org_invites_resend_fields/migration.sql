-- AlterTable
ALTER TABLE "OrgInvitation" ADD COLUMN     "lastSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "OrgInvitation_orgId_email_idx" ON "OrgInvitation"("orgId", "email");

-- CreateIndex
CREATE INDEX "OrgInvitation_orgId_status_idx" ON "OrgInvitation"("orgId", "status");
