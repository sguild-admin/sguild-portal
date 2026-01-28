/*
  Warnings:

  - You are about to drop the `SuperAdmin` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `invitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitation" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- DropTable
DROP TABLE "SuperAdmin";

-- CreateTable
CREATE TABLE "super_admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "super_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_userId_key" ON "super_admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tokenHash_key" ON "invitation"("tokenHash");
