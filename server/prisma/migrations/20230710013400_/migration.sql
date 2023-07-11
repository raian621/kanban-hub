/*
  Warnings:

  - Added the required column `hashpass` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hashpass" VARCHAR(100) NOT NULL;
