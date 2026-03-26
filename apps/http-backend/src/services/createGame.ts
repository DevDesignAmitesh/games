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
    const gameId = await prisma.$transaction(async (tx) => {
      const drawGame = await tx.drawingGame.create({
        data: {
          createdBy: userId,
          drawTime,
          numberOfPlayers,
          rounds,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { status: "SEARCHING" },
      });

      await tx.drawingGamePlayer.create({
        data: {
          userId,
          drawingGameId: drawGame.id,
          score: 0,
        },
      });
      
      return drawGame.id;
    });

    return res.status(201).json({
      message: "game created successfully",
      gameId,
    });
  } else if (gameType === "bodmas") {
    const gameId = await prisma.$transaction(async (tx) => {
      const bodmasGame = await tx.bodmasGame.create({
        data: {
          createdBy: userId,
          numberOfPlayers: 2,
          timeLimit: 60,
        },
      });
  
      await tx.user.update({
        where: { id: userId },
        data: { status: "SEARCHING" },
      });

      await tx.bodmasGamePlayer.create({
        data: {
          userId,
          bodmasGameId: bodmasGame.id
        },
      });
      
      return bodmasGame.id;
    })
    
    return res.status(201).json({
      message: "game created successfully",
      gameId,
    });
  }
};
