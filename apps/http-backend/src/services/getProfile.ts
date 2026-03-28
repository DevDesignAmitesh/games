import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;

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
        results: true
      }
    });

    return res.json({
      user: { ...user, count: friendCount },
      game: { opponentName },
      message: "profile found",
    });
  } catch (e) {
    console.log("error in getProfile ", e);
    return res.status(500).json({ message: "something went wrong" });
  }
};
