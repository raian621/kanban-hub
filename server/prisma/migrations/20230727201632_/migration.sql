-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_userOwnerId_fkey";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "userOwnerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
