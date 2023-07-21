-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "groupOwnerId" INTEGER,
ADD COLUMN     "orgOwnerId" INTEGER;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "groupOwnerId" INTEGER,
ADD COLUMN     "orgOwnerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_groupOwnerId_fkey" FOREIGN KEY ("groupOwnerId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_orgOwnerId_fkey" FOREIGN KEY ("orgOwnerId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_groupOwnerId_fkey" FOREIGN KEY ("groupOwnerId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_orgOwnerId_fkey" FOREIGN KEY ("orgOwnerId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
