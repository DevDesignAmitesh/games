import { prisma } from "@repo/db/db";
import { redisManager } from "@repo/redis/redis";
import type { CreateGameSchema } from "@repo/types/types";
import type { Request, Response } from "express";

export const createGame = async (
  req: Request<{}, {}, CreateGameSchema, {}>,
  res: Response,
) => {
  try {
    const { userId } = req.user;
    const { drawTime, numberOfPlayers, rounds, gameType } = req.body;

    console.log(
      "extracting req.body and req.user ",
      JSON.stringify({ ...req.user, ...req.body }),
    );

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

        console.log("creating drawing game");

        await tx.user.update({
          where: { id: userId },
          data: { status: "SEARCHING" },
        });

        console.log("updating user status");

        await tx.drawingGamePlayer.create({
          data: {
            userId,
            drawingGameId: drawGame.id,
            score: 0,
          },
        });

        console.log("creating game player");

        return drawGame.id;
      });

      return res.status(201).json({
        message: "game created successfully",
        gameId,
      });
    }

    if (gameType === "bodmas") {
      const gameId = await prisma.$transaction(async (tx) => {
        const bodmasGame = await tx.bodmasGame.create({
          data: {
            createdBy: userId,
            numberOfPlayers: 2,
            timeLimit: 60,
          },
        });

        console.log("create bodmas game");

        await tx.user.update({
          where: { id: userId },
          data: { status: "SEARCHING" },
        });

        console.log("updating user status");

        await tx.bodmasGamePlayer.create({
          data: {
            userId,
            bodmasGameId: bodmasGame.id,
          },
        });

        console.log("creating game player");

        return bodmasGame.id;
      });

      redisManager.del("/profile");

      return res.status(201).json({
        message: "game created successfully",
        gameId,
      });
    }
  } catch (e) {
    console.log("error in create game ", e);
    return res.status(500).json({ message: "something went wrong" });
  }
};
