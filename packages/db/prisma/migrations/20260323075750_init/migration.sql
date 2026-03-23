/*
  Warnings:

  - Added the required column `createdBy` to the `DrawingGame` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DrawingGamePlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DrawingGame" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DrawingGamePlayer" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DrawingGame" ADD CONSTRAINT "DrawingGame_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawingGamePlayer" ADD CONSTRAINT "DrawingGamePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
