import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

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

    const [friendCount, games] = await Promise.all([
      prisma.friendsMapUser.count({
        where: {
          OR: [{ senderId: user.id }, { receiverId: user.id }],
          status: "ACCEPTED",
        },
      }),

      prisma.bodmasGame.findMany({
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
      }),
    ]);

    const dataToSend = games.map((gm) => {
      const opponent = gm.players.find((p) => p.userId !== user.id);
      const oppResult = gm.results.find((r) => r.userId !== user.id);
      const meResult = gm.results.find((r) => r.userId === user.id);

      return {
        name: opponent?.user.userName,
        oppCorrectAnswer: oppResult?.correctAnswers,
        meCorrectAnswer: meResult?.correctAnswers,
        id: gm.id,
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
