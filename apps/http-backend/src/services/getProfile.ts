import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";
import { redisManager } from "@repo/redis/redis";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;

    const dataFromRedis = await redisManager.get("/profile");

    if (dataFromRedis) {
      return res.json({ ...dataFromRedis, message: "profile found" });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { userName: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const friendCount = await prisma.friendsMapUser.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    const games = await prisma.bodmasGame.findMany({
      where: {
        players: {
          some: {
            OR: [{ userId }],
          },
        },
      },
      include: {
        results: true,
        players: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const dataToSend = games.map((gm) => {
      const opponent = gm.players.find((p) => p.userId !== userId);
      const oppResult = gm.results.find((r) => r.userId !== userId);
      const meResult = gm.results.find((r) => r.userId === userId);

      return {
        name: opponent?.user.userName,
        oppCorrectAnswer: oppResult?.correctAnswers,
        meCorrectAnswer: meResult?.correctAnswers,
      };
    });

    await redisManager.set("/profile", {
      games: dataToSend,
      user: { ...user, count: friendCount },
    });

    return res.json({
      user: { ...user, count: friendCount },
      games: dataToSend,
      message: "profile found",
    });
  } catch (e) {
    console.log("error in getProfile ", e);
    return res.status(500).json({ message: "something went wrong" });
  }
};
