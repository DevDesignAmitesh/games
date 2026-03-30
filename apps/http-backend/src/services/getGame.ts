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
      questions: true,
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

  const question = game?.questions[gamePlr?.questionCounter];
  const me = game.players.find((plr) => plr.userId === userId)?.user;
  const opponent = game.players.find((plr) => plr.userId !== userId)?.user;
  const timeLimit = game.timeLimit;

  res.json({
    question,
    me,
    results: game.results,
    opponent,
    timeLimit,
  });
};
