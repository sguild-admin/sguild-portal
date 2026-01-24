-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "isDisabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "lastSignInAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "primaryEmail" TEXT;

-- CreateTable
CREATE TABLE "CoachProfile" (
    "id" UUID NOT NULL,
    "appUserId" UUID NOT NULL,
    "bio" TEXT,
    "notes" TEXT,
    "zip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_appUserId_key" ON "CoachProfile"("appUserId");

-- AddForeignKey
ALTER TABLE "OrgMembership" ADD CONSTRAINT "OrgMembership_clerkUserId_fkey" FOREIGN KEY ("clerkUserId") REFERENCES "AppUser"("clerkUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachProfile" ADD CONSTRAINT "CoachProfile_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
