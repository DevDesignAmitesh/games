/*
  Warnings:

  - Added the required column `timeSpent` to the `BodmasGameUserAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BodmasGameUserAnswer" ADD COLUMN     "timeSpent" INTEGER NOT NULL;
