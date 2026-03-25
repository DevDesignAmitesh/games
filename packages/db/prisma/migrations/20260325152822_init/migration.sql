/*
  Warnings:

  - You are about to drop the column `startTime` on the `BodmasGamePlayer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BodmasGamePlayer" DROP COLUMN "startTime";

-- AlterTable
ALTER TABLE "BodmasGameQuestion" ADD COLUMN     "startTime" INTEGER;
