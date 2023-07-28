/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Group` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_organizationId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "organizationId",
ADD COLUMN     "organizationOwnerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_organizationOwnerId_fkey" FOREIGN KEY ("organizationOwnerId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
