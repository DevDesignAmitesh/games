import { prisma } from "@repo/db/db";
import { redisManager } from "@repo/redis/redis";
import type { Request, Response } from "express";

export const findFriends = async (req: Request, res: Response) => {
  const { input } = req.params as { input: string };
  const start = Date.now();

  const key = `/find-friends/${input}`;

  const redisData = await redisManager.get(key);

  if (redisData) {
    console.log("redis end ", Date.now() - start);
    return res.json(redisData);
  }

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

  await redisManager.set(key, { users }, 60);
  console.log("end ", Date.now() - start);

  return res.json({ users });
};
