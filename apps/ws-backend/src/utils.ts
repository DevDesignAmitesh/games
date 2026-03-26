import { prisma, type BodmasQuestion } from "@repo/db/db";
import type { BoadMasGame } from "@repo/types/types";

function getRandomNums() {
  let a = Math.floor(Math.random() * 10 * 6);
  let b = Math.floor(Math.random() * 10 * 3);

  return { a, b };
}

export function generateRandomQuesions(): Array<BodmasQuestion> {
  let arr: BodmasQuestion[] = [];

  for (let i = 1; i <= 20; i++) {
    const { a, b } = getRandomNums();

    arr.push({
      id: crypto.randomUUID(),
      answer: a + b,
      createdAt: new Date(),
      operand1: a,
      operand2: b,
      operation: "ADD",
    });
  }
  return arr;
}

export const getGamesFromDb = async (): Promise<BoadMasGame[]> => {
  const games = await prisma.bodmasGame.findMany({
    include: {
      players: {
        include: {
          user: true,
        },
      },
      answers: true,
      questions: {
        include: { question: true },
      },
    },
  });

  const bodmasGame: BoadMasGame[] = games.map((gm) => {
    return {
      ...gm,
      players: gm.players.map((plr) => {
        return {
          id: plr.userId,
          username: plr.user.userName,
          status: plr.user.status,
          questionCounter: plr.questionCounter
        };
      }),
      answers: gm.answers,
      questions: gm.questions.map((qs) => {
        return qs.question;
      }),
    };
  });

  return bodmasGame;
};
