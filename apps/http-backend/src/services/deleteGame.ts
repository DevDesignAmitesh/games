import { redisManager } from "@repo/redis/redis";
import { prisma } from "@repo/db/db";
import { type Request, type Response } from "express";

export const deleteGame = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;

    const { gameId } = req.params as { gameId: string };

    const game = await prisma.bodmasGame.findFirst({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      return res.status(404).json({ message: "game not found" });
    }

    const key = `bodmas:game:${gameId}`;
    const value = `${userId}:${Date.now()}`;
    const lock = await redisManager.lock(key, value);

    if (lock === 0) {
      res.send(400).json({ message: "game is already started" });
      return;
    }

    if (game.players.length > 2) {
      res.send(400).json({ message: "game is already started" });
      return;
    }

    await prisma.bodmasGame.delete({
      where: { id: gameId },
    });

    return res.status(200).json({ message: "deleted" });
  } catch (e) {
    console.log("error in delete game ", e);
    return res.status(500).json({ message: "something went wrong" });
  }
};
