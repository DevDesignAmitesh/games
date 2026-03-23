import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getFriends = async (req: Request, res: Response) => {
  const { userId } = req.user;

  const friends = await prisma.friendsMapUser.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }]
    }
  });;

  return res.json({ friends, message: "friends found" });
};
