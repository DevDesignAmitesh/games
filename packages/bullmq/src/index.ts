import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { type RedisPushData, type BoadMasGame } from "@repo/types/types";
import { prisma } from "@repo/db/db";
import { redisManager } from "@repo/redis/redis";
import { bodmasgameManager, userManager } from "@repo/ws-backend/ws-backend";

class BullmqManager {
  private static connection: IORedis;
  private queue: Queue;
  private static instance: BullmqManager;

  private constructor() {
    this.queue = new Queue("game");
    const worker = new Worker(
      "game",
      async (job) => {
        this.handler(job.data, job.id);
      },
      { connection: BullmqManager.getConnection() },
    );

    worker.on("completed", (job) => {
      console.log("job completed ", job.id);
      console.log("job completed ", job.data);
    });
  }

  private static getConnection() {
    if (!BullmqManager.connection) {
      BullmqManager.connection = new IORedis({ maxRetriesPerRequest: null });
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
    console.log("pushing in queue");
    await this.queue.add(key, data, {
      delay: delay ? delay : undefined,
    });
  };

  // id is from bull mq => 1, 2, 3, so on...
  private handler = async (data: RedisPushData, id?: string) => {
    console.log("processing data ", JSON.stringify(data));
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

      await prisma.$transaction(async (tx) => {
        await tx.bodmasGamePlayer.create({
          data: {
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
      });
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

      await prisma.$transaction(async (tx) => {
        if (questions) {
          for (let [idx, qs] of questions.entries()) {
            await tx.bodmasQuestion.create({
              data: qs,
            });
          }
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
      });
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

      if (!existingQuestion) {
        console.log("existing questions no found");
        return;
      }

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
    }

    if (data.type === "TRACK_BODMAS_GAME") {
      const { gameId } = data.payload;

      const bodmasGame = await prisma.bodmasGame.findFirst({
        where: { id: gameId },
        include: { players: true },
      });

      if (!bodmasGame) return;

      await prisma.$transaction(async (tx) => {
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

        const latestGame: BoadMasGame = {
          ...updatedGame,
          players: updatedGame.players.map((plr) => {
            return {
              id: plr.userId,
              username: plr.user.userName,
              status: plr.user.status,
              questionCounter: plr.questionCounter,
            };
          }),
          questions: updatedGame.questions.map((qs) => {
            return qs.question;
          }),
          gameQuestions: updatedGame.questions.flatMap((qs) => {
            return qs.userAnswer.map((usr) => {
              return {
                gameId: qs.gameId,
                questionId: qs.questionId,
                userId: usr.userId,
                startTime: qs.startTime ? qs.startTime : undefined,
                orderIndex: qs.orderIndex,
              };
            });
          }),
        };

        // TODO: if the game is ended then there is no need to keep data in memory
        // bodmasgameManager.updateGame(latestGame);

        bodmasgameManager.clearGame(latestGame);

        for (let [_idx, plr] of bodmasGame.players.entries()) {
          await tx.user.update({
            where: { id: plr.userId },
            data: { status: "IDOL" },
          });

          userManager.update(plr.userId, { status: "IDOL" });

          let correctAnswers = 0;
          let incorrectAnswers = 0;

          const answers = await prisma.bodmasGameUserAnswer.findMany({
            where: { gameId, userId: plr.userId },
          });

          for (let [_idx, ans] of answers.entries()) {
            if (ans.isCorrect) {
              correctAnswers += 1;
            } else {
              incorrectAnswers += 1;
            }
          }
          await tx.bodmasGameResult.create({
            data: {
              gameId,
              userId: plr.userId,
              correctAnswers,
              incorrectAnswers,
            },
          });
        }
      });

      redisManager.publish(`bodmas:game:${gameId}`, {
        type: "BODMAS_GAME_ENDS",
      });
    }
  };
}

export const bullmqManager = BullmqManager.getInstance();
