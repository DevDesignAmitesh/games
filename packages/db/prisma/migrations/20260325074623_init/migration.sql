/*
  Warnings:

  - Added the required column `totalGamePlayed` to the `Analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalUsers` to the `Analytics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Analytics" ADD COLUMN     "totalGamePlayed" INTEGER NOT NULL,
ADD COLUMN     "totalUsers" INTEGER NOT NULL;
