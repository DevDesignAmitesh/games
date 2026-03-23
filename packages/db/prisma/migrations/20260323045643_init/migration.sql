-- CreateEnum
CREATE TYPE "AdminGameStatus" AS ENUM ('running', 'under_development');

-- CreateEnum
CREATE TYPE "DrawingGameLanguage" AS ENUM ('en');

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IGNORED');

-- CreateEnum
CREATE TYPE "BodmasQuestionOperations" AS ENUM ('ADD', 'SUB', 'MUL', 'DIV');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING_FOR_PLAYERS', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('IDOL', 'PLAYING', 'SEARCHING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "UserStatus" NOT NULL DEFAULT 'IDOL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodmasGamePlayer" (
    "id" TEXT NOT NULL,
    "bodmasGameId" TEXT NOT NULL,

    CONSTRAINT "BodmasGamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodmasGame" (
    "id" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING_FOR_PLAYERS',
    "createdBy" TEXT NOT NULL,
    "endTime" TIMESTAMP(3),
    "startTime" TIMESTAMP(3),
    "timeLimit" INTEGER NOT NULL,
    "numberOfPlayers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodmasGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodmasGameResult" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "incorrectAnswers" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "ratingBefore" INTEGER NOT NULL,
    "ratingAfter" INTEGER NOT NULL,
    "ratingChange" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodmasGameResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodmasGameUserAnswer" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodmasGameUserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodmasQuestion" (
    "id" TEXT NOT NULL,
    "operation" "BodmasQuestionOperations" NOT NULL,
    "operand1" INTEGER NOT NULL,
    "operand2" INTEGER NOT NULL,
    "answer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodmasQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodmasGameQuestion" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "BodmasGameQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawingGame" (
    "id" TEXT NOT NULL,
    "numberOfPlayers" INTEGER NOT NULL,
    "language" "DrawingGameLanguage" NOT NULL DEFAULT 'en',
    "drawTime" INTEGER NOT NULL,
    "rounds" INTEGER NOT NULL,
    "status" "GameStatus" NOT NULL,

    CONSTRAINT "DrawingGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawingGamePlayer" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "drawingGameId" TEXT NOT NULL,

    CONSTRAINT "DrawingGamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendsMapUser" (
    "id" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FriendsMapUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminGame" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "AdminGameStatus" NOT NULL,

    CONSTRAINT "AdminGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BodmasGameResult_gameId_userId_key" ON "BodmasGameResult"("gameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BodmasGameUserAnswer_gameId_userId_questionId_key" ON "BodmasGameUserAnswer"("gameId", "userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "BodmasGameQuestion_gameId_questionId_key" ON "BodmasGameQuestion"("gameId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "FriendsMapUser_receiverId_senderId_key" ON "FriendsMapUser"("receiverId", "senderId");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_identifier_key" ON "Otp"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "AdminGame_slug_key" ON "AdminGame"("slug");

-- AddForeignKey
ALTER TABLE "BodmasGamePlayer" ADD CONSTRAINT "BodmasGamePlayer_bodmasGameId_fkey" FOREIGN KEY ("bodmasGameId") REFERENCES "BodmasGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGame" ADD CONSTRAINT "BodmasGame_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameResult" ADD CONSTRAINT "BodmasGameResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BodmasGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameResult" ADD CONSTRAINT "BodmasGameResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameUserAnswer" ADD CONSTRAINT "BodmasGameUserAnswer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BodmasGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameUserAnswer" ADD CONSTRAINT "BodmasGameUserAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameUserAnswer" ADD CONSTRAINT "BodmasGameUserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BodmasQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameQuestion" ADD CONSTRAINT "BodmasGameQuestion_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "BodmasGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodmasGameQuestion" ADD CONSTRAINT "BodmasGameQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BodmasQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawingGamePlayer" ADD CONSTRAINT "DrawingGamePlayer_drawingGameId_fkey" FOREIGN KEY ("drawingGameId") REFERENCES "DrawingGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendsMapUser" ADD CONSTRAINT "FriendsMapUser_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendsMapUser" ADD CONSTRAINT "FriendsMapUser_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
