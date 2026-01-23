-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('ADMIN', 'COACH');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryAdminClerkUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" UUID NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgMembership" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_clerkOrgId_key" ON "Organization"("clerkOrgId");

-- CreateIndex
CREATE INDEX "Organization_primaryAdminClerkUserId_idx" ON "Organization"("primaryAdminClerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_clerkUserId_key" ON "AppUser"("clerkUserId");

-- CreateIndex
CREATE INDEX "OrgMembership_clerkUserId_idx" ON "OrgMembership"("clerkUserId");

-- CreateIndex
CREATE INDEX "OrgMembership_orgId_role_status_idx" ON "OrgMembership"("orgId", "role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMembership_orgId_clerkUserId_key" ON "OrgMembership"("orgId", "clerkUserId");

-- AddForeignKey
ALTER TABLE "OrgMembership" ADD CONSTRAINT "OrgMembership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
