/*
  Warnings:

  - You are about to drop the column `phone` on the `AppUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppUser" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "CoachProfile" ADD COLUMN     "phone" TEXT;
