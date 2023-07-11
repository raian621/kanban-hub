/*
  Warnings:

  - You are about to drop the column `hashpass` on the `User` table. All the data in the column will be lost.
  - Added the required column `passhash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashpass",
ADD COLUMN     "passhash" VARCHAR(100) NOT NULL;
