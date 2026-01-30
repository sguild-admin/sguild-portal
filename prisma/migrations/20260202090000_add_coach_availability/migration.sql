-- AlterTable
ALTER TABLE "coach_profile" ADD COLUMN     "address" TEXT,
ADD COLUMN     "nickname" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "coach_availability" (
    "id" TEXT NOT NULL,
    "coachProfileId" TEXT NOT NULL,
    "dayOfWeek" "Weekday" NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "coach_availability_coachProfileId_dayOfWeek_idx" ON "coach_availability"("coachProfileId", "dayOfWeek");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'coach_availability_coachProfileId_fkey'
            AND table_name = 'coach_availability'
    ) THEN
        ALTER TABLE "coach_availability" ADD CONSTRAINT "coach_availability_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "coach_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
