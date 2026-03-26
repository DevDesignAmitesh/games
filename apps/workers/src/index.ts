import { prisma } from "@repo/db/db";
import { redisManager } from "@repo/redis/redis";
import type { RedisPushData } from "@repo/types/types";

async function main() {
  try {
    const response = await redisManager.pop("bodmas:game");

    if (!response) {
      console.log("nothing");
      return;
    }

    console.log("this is the data ", response);
    let parsedData = {} as RedisPushData;

    try {
      parsedData = JSON.parse(response);
    } catch (e) {
      console.log("parsing error in worker ", e);
      return;
    }

    if (parsedData.type === "BODMAS_GAME_ACCEPT") {
      const { acceptedBy, createdBy, gameId } = parsedData.payload;

      const [acceptor, creator, bodmasGame] = await Promise.all([
        prisma.user.findFirst({
          where: { id: acceptedBy },
        }),
        prisma.user.findFirst({
          where: { id: createdBy },
        }),
        prisma.bodmasGame.findFirst({
          where: { id: gameId },
        }),
      ]);

      if (!bodmasGame || !acceptor || !creator) return;

      if (bodmasGame.createdBy !== creator.id) return;

      await prisma.$transaction(async (tx) => {
        await tx.bodmasGamePlayer.create({
          data: {
            userId: acceptor.id,
            bodmasGameId: bodmasGame.id,
          },
        });

        await tx.bodmasGame.update({
          where: { id: bodmasGame.id },
          data: { status: "IN_PROGRESS", startTime: new Date() },
        });

        await tx.user.update({
          where: { id: acceptor.id },
          data: { status: "PLAYING" },
        });

        await tx.user.update({
          where: { id: creator.id },
          data: { status: "PLAYING" },
        });
      });
    }

    if (parsedData.type === "START_BODMAS_GAME") {
      const {
        questionCounter,
        questionStartTimeWithId,
        questions,
        gameId,
        userId,
      } = parsedData.payload;

      await prisma.$transaction(async (tx) => {
        questions.forEach(async (qs, idx) => {
          const question = await tx.bodmasQuestion.create({
            data: qs,
          });

          await tx.bodmasGameQuestion.create({
            data: {
              gameId,
              questionId: question.id,
              orderIndex: idx,
            },
          });
        });

        await tx.bodmasGamePlayer.update({
          where: {
            bodmasGameId_userId: {
              bodmasGameId: gameId,
              userId,
            },
          },
          data: {
            questionCounter,
          },
        });

        await tx.bodmasGameQuestion.update({
          where: { id: questionStartTimeWithId.id },
          data: { startTime: questionStartTimeWithId.startTime },
        });
      });
    }

    if (parsedData.type === "BODMAS_GAME_ANSWER") {
      const { answer } = parsedData.payload;

      // if already existing then update it else create

      await prisma.bodmasGameUserAnswer.upsert({
        where: {
          id: answer.id,
        },
        create: answer,
        update: answer,
      });
    }

    if (parsedData.type === "TRACK_BODMAS_GAME") {
      const { gameId } = parsedData.payload;

      const bodmasGame = await prisma.bodmasGame.findFirst({
        where: { id: gameId },
        include: { players: true },
      });

      if (!bodmasGame) return;

      setTimeout(async () => {
        await prisma.$transaction(async (tx) => {
          await tx.bodmasGame.update({
            where: { id: gameId },
            data: {
              status: "COMPLETED",
              endTime: new Date(),
              updatedAt: new Date(),
            },
          });

          bodmasGame.players.forEach(async (plr) => {
            await tx.user.update({
              where: { id: plr.userId },
              data: { status: "IDOL" },
            });

            const answers = await tx.bodmasGameUserAnswer.findMany({
              where: { userId: plr.userId, gameId },
            });

            let correctAnswers = 0;
            let incorrectAnswers = 0;

            answers.forEach((ans) => {
              if (ans.isCorrect) {
                correctAnswers += 1;
              } else {
                incorrectAnswers += 1;
              }
            });

            await tx.bodmasGameResult.create({
              data: {
                gameId,
                userId: plr.userId,
                correctAnswers,
                incorrectAnswers,
              },
            });
          });
        });

        redisManager.publish(`bodmas:game:${gameId}`, {
          type: "BODMAS_GAME_ENDS",
        });

        // bodmasGame.timeLimit => in seconds
      }, bodmasGame.timeLimit * 1000);
    }
  } catch (e) {
    console.log("error in worker ", e);
  }
}

setInterval(main, 1000);

