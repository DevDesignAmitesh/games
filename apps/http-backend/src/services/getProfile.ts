import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";
import { redisManager } from "@repo/redis/redis";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { username } = req.params as { username: string };

    const user = await prisma.user.findFirst({
      where: { userName: username },
      select: { userName: true, email: true, id: true },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const key = `/profile/${user.id}`;
    const dataFromRedis = await redisManager.get(key);

    console.log("dataFromRedis");
    console.log(dataFromRedis);

    if (dataFromRedis) {
      return res.json({ ...dataFromRedis, message: "profile found" });
    }

    const friendCount = await prisma.friendsMapUser.count({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
    });

    const games = await prisma.bodmasGame.findMany({
      where: {
        players: {
          some: {
            OR: [{ userId: user.id }],
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
      const opponent = gm.players.find((p) => p.userId !== user.id);
      const oppResult = gm.results.find((r) => r.userId !== user.id);
      const meResult = gm.results.find((r) => r.userId === user.id);

      return {
        name: opponent?.user.userName,
        oppCorrectAnswer: oppResult?.correctAnswers,
        meCorrectAnswer: meResult?.correctAnswers,
      };
    });

    let friendStatus;

    if (user.id !== userId) {
      friendStatus = await prisma.friendsMapUser.findFirst({
        where: {
          OR: [
            { receiverId: userId, senderId: user.id },
            { senderId: userId, receiverId: user.id },
          ],
        },
      });
    }

    await redisManager.set(
      key,
      {
        games: dataToSend,
        user: { ...user, count: friendCount },
        status: friendStatus?.status,
      },
      60,
    );

    return res.json({
      user: { ...user, count: friendCount },
      games: dataToSend,
      status: friendStatus?.status,
      message: "profile found",
    });
  } catch (e) {
    console.log("error in getProfile ", e);
    return res.status(500).json({ message: "something went wrong" });
  }
};
