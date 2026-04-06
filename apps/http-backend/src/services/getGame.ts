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

  return res.json({
    question,
    results: game.results,
    players: game.players,
    endTime: game.endTime,
    startTime: game.startTime,
    status: game.status,
  });
};
