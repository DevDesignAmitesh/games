import { prisma } from "@repo/db/db";
import { redisManager } from "@repo/redis/redis";
import type { RedisPushData } from "@repo/types/types";

async function main() {
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

    prisma.$transaction(async (tx) => {
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
  } else if (parsedData.type === "START_BODMAS_GAME") {
    const {
      questionCounter,
      questionStartTimeWithId,
      questions,
      gameId,
      userId,
    } = parsedData.payload;

    prisma.$transaction(async (tx) => {
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
}

setInterval(main, 3000);
