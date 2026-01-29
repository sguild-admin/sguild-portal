-- AlterTable
ALTER TABLE "coach_profile" ADD COLUMN     "address" TEXT,
ADD COLUMN     "nickname" TEXT;

-- CreateTable
CREATE TABLE "coach_availability" (
    "id" UUID NOT NULL,
    "coachProfileId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_availability_coachProfileId_idx" ON "coach_availability"("coachProfileId");

-- AddForeignKey
ALTER TABLE "coach_availability" ADD CONSTRAINT "coach_availability_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "coach_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
