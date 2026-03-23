import { prisma } from "@repo/db/db";
import type { CreateGameSchema } from "@repo/types/types";
import type { Request, Response } from "express";

type TypedRequest<P, B, Q> = Request<P, any, B, Q>;

export const createGame = async (
  req: TypedRequest<CreateGameSchema, CreateGameSchema, {}>,
  res: Response,
) => {
  const { userId } = req.user;
  const { drawTime, numberOfPlayers, rounds } = req.body;
  const { gameType } = req.params;

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
