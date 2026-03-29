import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const findFriends = async (req: Request, res: Response) => {
  const { input } = req.params as { input: string };

  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          userName: {
            contains: input,
            mode: "insensitive",
          },
          email: {
            contains: input,
            mode: "insensitive",
          },
        },
      ],
    },

    select: { id: true, userName: true },
  });

  return res.json({ users });
};
