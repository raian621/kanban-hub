/*
  Warnings:

  - Added the required column `organizationId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userOwnerId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userOwnerId` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "userOwnerId" INTEGER;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "userOwnerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "userOwnerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Pipeline" ADD COLUMN     "userOwnerId" INTEGER;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "userOwnerId" INTEGER;

-- CreateTable
CREATE TABLE "UserInBoard" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "boardId" INTEGER NOT NULL,

    CONSTRAINT "UserInBoard_pkey" PRIMARY KEY ("userId","boardId")
);

-- CreateTable
CREATE TABLE "UserInWorkspace" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "UserInWorkspace_pkey" PRIMARY KEY ("userId","workspaceId")
);

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_userOwnerId_fkey" FOREIGN KEY ("userOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInBoard" ADD CONSTRAINT "UserInBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInBoard" ADD CONSTRAINT "UserInBoard_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInWorkspace" ADD CONSTRAINT "UserInWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInWorkspace" ADD CONSTRAINT "UserInWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
