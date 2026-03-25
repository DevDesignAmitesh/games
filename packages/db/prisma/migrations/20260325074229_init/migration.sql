/*
  Warnings:

  - You are about to drop the `AdminGame` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AdminGame";

-- DropEnum
DROP TYPE "AdminGameStatus";

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "liveUsers" INTEGER NOT NULL,
    "bodmasPlaying" INTEGER NOT NULL,
    "drawingPlaying" INTEGER NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);
