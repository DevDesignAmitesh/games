/*
  Warnings:

  - The `startTime` column on the `BodmasGameQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BodmasGameQuestion" DROP COLUMN "startTime",
ADD COLUMN     "startTime" BIGINT;
