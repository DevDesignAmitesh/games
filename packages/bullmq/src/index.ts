import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { type RedisPushData } from "@repo/types/types";
import { prisma } from "@repo/db/db";
import { redisManager } from "@repo/redis/redis";
import { userManager } from "@repo/ws-backend/ws-backend";

const REDIS_URL = process.env.REDIS_URL!;

class BullmqManager {
  private static connection: IORedis;
  private queue: Queue;
  private static instance: BullmqManager;

  private constructor() {
    this.queue = new Queue("game", {
      connection: BullmqManager.getConnection(),
    });
    const worker = new Worker(
      "game",
      async (job) => {
        this.handler(job.data, job.id);
      },
      { connection: BullmqManager.getConnection(), concurrency: 1 },
    );

    worker.on("completed", (job) => {});
  }

  private static getConnection() {
    if (!BullmqManager.connection) {
      BullmqManager.connection = new IORedis(REDIS_URL, {
        maxRetriesPerRequest: null,
      });
    }
    return BullmqManager.connection;
  }

  public static getInstance() {
    if (!BullmqManager.instance) {
      BullmqManager.instance = new BullmqManager();
    }
    return BullmqManager.instance;
  }

  // delay = mili-seconds
  push = async (key: string, data: RedisPushData, delay?: number) => {
    await this.queue.add(key, data, {
      delay: delay ? delay : undefined,
    });
  };

  // id is from bull mq => 1, 2, 3, so on...
  private handler = async (data: RedisPushData, id?: string) => {
    if (data.type === "BODMAS_GAME_ACCEPT") {
      const { acceptedBy, createdBy, gameId, startTime, endTime } =
        data.payload;

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

      await prisma.$transaction(
        async (tx) => {
          await tx.bodmasGamePlayer.upsert({
            where: {
              bodmasGameId_userId: {
                userId: acceptor.id,
                bodmasGameId: bodmasGame.id,
              },
            },
            create: {
              userId: acceptor.id,
              bodmasGameId: bodmasGame.id,
            },
            update: {
              userId: acceptor.id,
              bodmasGameId: bodmasGame.id,
            },
          });

          await tx.bodmasGame.update({
            where: { id: bodmasGame.id },
            data: { status: "IN_PROGRESS", startTime, endTime },
          });

          await tx.user.update({
            where: { id: acceptor.id },
            data: { status: "PLAYING" },
          });

          await tx.user.update({
            where: { id: creator.id },
            data: { status: "PLAYING" },
          });
        },
        {
          maxWait: 5000, // Time to wait for a connection (default 2s)
          timeout: 10000, // Time for the entire transaction (default 5s)
        },
      );
    }

    if (data.type === "START_BODMAS_GAME") {
      const {
        questionCounter,
        questions,
        gameId,
        userId,
        gameQuestion,
        questionStartTime,
        orderIndex,
      } = data.payload;

      await prisma.$transaction(
        async (tx) => {
          if (questions) {
            await tx.bodmasQuestion.createMany({
              data: questions,
            });
          }

          await tx.bodmasGameQuestion.upsert({
            where: {
              gameId_questionId: {
                gameId,
                questionId: gameQuestion.id,
              },
            },
            create: {
              gameId,
              questionId: gameQuestion.id,
              orderIndex,
            },
            update: {
              startTime: questionStartTime,
            },
          });

          await tx.bodmasGamePlayer.upsert({
            where: {
              bodmasGameId_userId: {
                bodmasGameId: gameId,
                userId,
              },
            },
            create: {
              questionCounter,
              bodmasGameId: gameId,
              userId,
            },
            update: {
              questionCounter,
            },
          });
        },
        {
          maxWait: 5000, // Time to wait for a connection (default 2s)
          timeout: 10000, // Time for the entire transaction (default 5s)
        },
      );
    }

    if (data.type === "BODMAS_GAME_ANSWER") {
      const { answer } = data.payload;

      const existingQuestion = await prisma.bodmasGameQuestion.findUnique({
        where: {
          gameId_questionId: {
            gameId: answer.gameId,
            questionId: answer.questionId,
          },
        },
      });

      if (!existingQuestion) return;

      const existingAnswer = await prisma.bodmasGameUserAnswer.findUnique({
        where: {
          gameId_userId_questionId: {
            gameId: answer.gameId,
            userId: answer.userId,
            questionId: existingQuestion.id,
          },
        },
      });

      if (existingAnswer) {
        await prisma.bodmasGameUserAnswer.update({
          where: {
            gameId_userId_questionId: {
              gameId: answer.gameId,
              userId: answer.userId,
              questionId: existingQuestion.id,
            },
          },
          data: {
            isCorrect: answer.isCorrect,
            answer: answer.answer,
            timeSpent: answer.timeSpent,
            answeredAt: answer.answeredAt,
          },
        });
      } else {
        await prisma.bodmasGameUserAnswer.create({
          data: {
            answer: answer.answer,
            isCorrect: answer.isCorrect,
            timeSpent: answer.timeSpent,
            gameId: answer.gameId,
            userId: answer.userId,
            questionId: existingQuestion.id,
          },
        });
      }

      const existingResult = await prisma.bodmasGameResult.findUnique({
        where: {
          gameId_userId: {
            gameId: answer.gameId,
            userId: answer.userId,
          },
        },
      });

      if (existingResult) {
        await prisma.bodmasGameResult.update({
          where: {
            gameId_userId: {
              gameId: answer.gameId,
              userId: answer.userId,
            },
          },
          data: {
            incorrectAnswers: answer.isCorrect
              ? existingResult.incorrectAnswers
              : { increment: 1 },
            correctAnswers: answer.isCorrect
              ? { increment: 1 }
              : existingResult.correctAnswers,
          },
        });
      } else {
        await prisma.bodmasGameResult.create({
          data: {
            userId: answer.userId,
            gameId: answer.gameId,
            incorrectAnswers: answer.isCorrect ? 0 : 1,
            correctAnswers: answer.isCorrect ? 1 : 0,
          },
        });
      }
    }

    if (data.type === "TRACK_BODMAS_GAME") {
      const { gameId } = data.payload;

      const players: string[] = [];

      await prisma.$transaction(
        async (tx) => {
          const updatedGame = await tx.bodmasGame.update({
            where: { id: gameId },
            data: {
              status: "COMPLETED",
              updatedAt: new Date(),
            },
            include: {
              players: {
                include: {
                  user: true,
                },
              },
              answers: true,
              questions: {
                include: { question: true, userAnswer: true },
              },
            },
          });

          for (let [_idx, plr] of updatedGame.players.entries()) {
            await tx.user.update({
              where: { id: plr.userId },
              data: { status: "IDOL" },
            });

            players.push(plr.userId);

            userManager.update(plr.userId, { status: "IDOL" });

            const [correctAnswers, incorrectAnswers] = await Promise.all([
              tx.bodmasGameUserAnswer.count({
                where: { gameId, userId: plr.userId, isCorrect: true },
              }),
              tx.bodmasGameUserAnswer.count({
                where: { gameId, userId: plr.userId, isCorrect: false },
              }),
            ]);

            await tx.bodmasGameResult.upsert({
              where: {
                gameId_userId: {
                  gameId,
                  userId: plr.userId,
                },
              },
              update: {
                correctAnswers,
                incorrectAnswers,
              },
              create: {
                gameId,
                userId: plr.userId,
                correctAnswers,
                incorrectAnswers,
              },
            });
          }
        },
        {
          maxWait: 5000, // Time to wait for a connection (default 2s)
          timeout: 10000, // Time for the entire transaction (default 5s)
        },
      );

      await redisManager.publish(`room:game:${gameId}`, {
        type: "BODMAS_GAME_ENDS",
        payload: { gameId },
      });
    }
  };
}

export const bullmqManager = BullmqManager.getInstance();
