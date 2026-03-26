import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getResults = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params as { gameId: string | undefined };

    const results = await prisma.bodmasGameResult.findMany({
      where: { gameId },
      include: {
        user: {
          select: { userName: true },
        },
      },
    });

    if (!results.length) {
      return res.status(400).json({
        message: "results not found",
      });
    }

    return res.json({ results });
  } catch (e) {
    console.log("error in get results ", e);
    return res.status(500).json({ message: "something went wrong" })
  }
};
