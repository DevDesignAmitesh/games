import { prisma } from "@repo/db/db";
import type { CreateGameSchema } from "@repo/types/types";
import type { Request, Response } from "express";

export const createGame = async (
  req: Request<{}, {}, CreateGameSchema, {}>,
  res: Response,
) => {
  const { userId } = req.user;
  const { drawTime, numberOfPlayers, rounds, gameType } = req.body;

  if (gameType === "drawing") {
    const drawGame = await prisma.drawingGame.create({
      data: {
        createdBy: userId,
        drawTime,
        numberOfPlayers,
        rounds,
      },
    });

    return res.status(201).json({
      message: "game created successfully",
      gameId: drawGame.id,
    });
  }
};
