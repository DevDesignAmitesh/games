import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getResults = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { gameId } = req.params as { gameId: string | undefined };

    const results = await prisma.bodmasGameResult.findMany({
      where: { gameId },
      include: {
        user: {
          select: { userName: true, id: true, status: true },
        },
      },
    });

    if (!results.length) {
      return res.status(400).json({
        message: "results not found",
      });
    }

    const me = results.find((rsl) => rsl.userId === userId)
    const opponent = results.find((rsl) => rsl.userId !== userId)

    const dataToSend = {
      me: {
        ...me,
        user: {
          username: me?.user.userName,
          ...me?.user
        }
      },
      opponent: {
        ...opponent,
        user: {
          username: opponent?.user.userName,
          ...opponent?.user
        }
      },
    }

    return res.json(dataToSend);
  } catch (e) {
    console.log("error in get results ", e);
    return res.status(500).json({ message: "something went wrong" });
  }
};
