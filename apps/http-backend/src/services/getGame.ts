import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getGame = async (req: Request, res: Response) => {
  const { userId } = req.user;

  const { gameId } = req.params as { gameId: string };

  const game = await prisma.bodmasGame.findFirst({
    where: { id: gameId },
    include: {
      players: { include: { user: true } },
      results: true,
      questions: { include: { question: true } },
    },
  });

  if (!game) {
    return res.status(404).json({ message: "game not found" });
  }
  const gamePlr = await prisma.bodmasGamePlayer.findFirst({
    where: { userId, bodmasGameId: gameId },
  });

  if (!gamePlr) {
    return res.status(404).json({ message: "game player not found" });
  }

  const question = game?.questions[gamePlr?.questionCounter]?.question;
  const me = game.players.find((plr) => plr.userId === userId)?.user;
  const opponent = game.players.find((plr) => plr.userId !== userId)?.user;
  const oppsResult = game.results.find((rsl) => rsl.userId !== userId);
  const meResult = game.results.find((rsl) => rsl.userId === userId);
  const timeLimit = game.endTime;

  console.log("game ", game)
  console.log("question ", question)

  res.json({
    question,
    me,
    meResult,
    oppsResult,
    opponent,
    timeLimit,
  });
};
