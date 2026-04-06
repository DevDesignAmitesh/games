-- DropForeignKey
ALTER TABLE "BodmasGame" DROP CONSTRAINT "BodmasGame_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "BodmasGamePlayer" DROP CONSTRAINT "BodmasGamePlayer_bodmasGameId_fkey";

-- DropForeignKey
ALTER TABLE "BodmasGamePlayer" DROP CONSTRAINT "BodmasGamePlayer_userId_fkey";

-- DropForeignKey
ALTER TABLE "BodmasGameQuestion" DROP CONSTRAINT "BodmasGameQuestion_gameId_fkey";

-- DropForeignKey
ALTER TABLE "BodmasGameQuestion" DROP CONSTRAINT "BodmasGameQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "BodmasGameResult" DROP CONSTRAINT "BodmasGameResult_gameId_fkey";

-- DropForeignKey
ALTER TABLE "BodmasGameResult" DROP CONSTRAINT "BodmasGameResult_userId_fkey";

-- DropForeignKey
ALTER TABLE "BodmasGameUserAnswer" DROP CONSTRAINT "BodmasGameUserAnswer_gameId_fkey";

-- DropForeignKey
ALTER TABLE "BodmasGameUserAnswer" DROP CONSTRAINT "BodmasGameUserAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "BodmasGameUserAnswer" DROP CONSTRAINT "BodmasGameUserAnswer_userId_fkey";

-- DropForeignKey
ALTER TABLE "DrawingGame" DROP CONSTRAINT "DrawingGame_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "DrawingGamePlayer" DROP CONSTRAINT "DrawingGamePlayer_drawingGameId_fkey";

-- DropForeignKey
ALTER TABLE "DrawingGamePlayer" DROP CONSTRAINT "DrawingGamePlayer_userId_fkey";

-- DropForeignKey
ALTER TABLE "FriendsMapUser" DROP CONSTRAINT "FriendsMapUser_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "FriendsMapUser" DROP CONSTRAINT "FriendsMapUser_senderId_fkey";

-- AddForeignKey
ALTER TABLE "BodmasGamePlayer" ADD CONSTRAINT "BodmasGamePlayer_bodmasGameId_fkey" FOREIGN KEY ("bodmasGameId") REFERENCES "BodmasGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGamePlayer" ADD CONSTRAINT "BodmasGamePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGame" ADD CONSTRAINT "BodmasGame_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameResult" ADD CONSTRAINT "BodmasGameResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BodmasGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameResult" ADD CONSTRAINT "BodmasGameResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameUserAnswer" ADD CONSTRAINT "BodmasGameUserAnswer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BodmasGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameUserAnswer" ADD CONSTRAINT "BodmasGameUserAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameUserAnswer" ADD CONSTRAINT "BodmasGameUserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BodmasGameQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameQuestion" ADD CONSTRAINT "BodmasGameQuestion_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BodmasGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameQuestion" ADD CONSTRAINT "BodmasGameQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BodmasQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawingGame" ADD CONSTRAINT "DrawingGame_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawingGamePlayer" ADD CONSTRAINT "DrawingGamePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawingGamePlayer" ADD CONSTRAINT "DrawingGamePlayer_drawingGameId_fkey" FOREIGN KEY ("drawingGameId") REFERENCES "DrawingGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendsMapUser" ADD CONSTRAINT "FriendsMapUser_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendsMapUser" ADD CONSTRAINT "FriendsMapUser_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
