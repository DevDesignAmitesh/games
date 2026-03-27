/*
  Warnings:

  - The `endTime` column on the `BodmasGame` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startTime` column on the `BodmasGame` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `answeredAt` column on the `BodmasGameUserAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `respondedAt` column on the `FriendsMapUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BodmasGame" DROP COLUMN "endTime",
ADD COLUMN     "endTime" BIGINT,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" BIGINT;

-- AlterTable
ALTER TABLE "BodmasGameUserAnswer" DROP COLUMN "answeredAt",
ADD COLUMN     "answeredAt" BIGINT;

-- AlterTable
ALTER TABLE "FriendsMapUser" DROP COLUMN "respondedAt",
ADD COLUMN     "respondedAt" BIGINT;
