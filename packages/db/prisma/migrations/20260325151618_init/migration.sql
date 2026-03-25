/*
  Warnings:

  - A unique constraint covering the columns `[bodmasGameId,userId]` on the table `BodmasGamePlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BodmasGamePlayer_bodmasGameId_userId_key" ON "BodmasGamePlayer"("bodmasGameId", "userId");
