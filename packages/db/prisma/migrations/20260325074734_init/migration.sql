/*
  Warnings:

  - You are about to drop the column `totalGamePlayed` on the `Analytics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Analytics" DROP COLUMN "totalGamePlayed",
ADD COLUMN     "totalBodmasGamePlayed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDrawingGamePlayed" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "liveUsers" SET DEFAULT 0,
ALTER COLUMN "bodmasPlaying" SET DEFAULT 0,
ALTER COLUMN "drawingPlaying" SET DEFAULT 0,
ALTER COLUMN "totalUsers" SET DEFAULT 0;
