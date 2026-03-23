/*
  Warnings:

  - You are about to drop the column `rank` on the `BodmasGameResult` table. All the data in the column will be lost.
  - You are about to drop the column `ratingAfter` on the `BodmasGameResult` table. All the data in the column will be lost.
  - You are about to drop the column `ratingBefore` on the `BodmasGameResult` table. All the data in the column will be lost.
  - You are about to drop the column `ratingChange` on the `BodmasGameResult` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `BodmasGameResult` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `BodmasGameResult` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `BodmasGameUserAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeen` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `BodmasGamePlayer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BodmasGameUserAnswer" DROP CONSTRAINT "BodmasGameUserAnswer_questionId_fkey";

-- AlterTable
ALTER TABLE "BodmasGamePlayer" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BodmasGameResult" DROP COLUMN "rank",
DROP COLUMN "ratingAfter",
DROP COLUMN "ratingBefore",
DROP COLUMN "ratingChange",
DROP COLUMN "score",
DROP COLUMN "timeSpent";

-- AlterTable
ALTER TABLE "BodmasGameUserAnswer" DROP COLUMN "timeSpent",
ALTER COLUMN "answeredAt" DROP NOT NULL,
ALTER COLUMN "answeredAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DrawingGame" ALTER COLUMN "status" SET DEFAULT 'WAITING_FOR_PLAYERS';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified",
DROP COLUMN "lastSeen",
DROP COLUMN "rating";

-- DropTable
DROP TABLE "Otp";

-- AddForeignKey
ALTER TABLE "BodmasGamePlayer" ADD CONSTRAINT "BodmasGamePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameUserAnswer" ADD CONSTRAINT "BodmasGameUserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BodmasGameQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
