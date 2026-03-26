import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getFriends = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;

    const friends = await prisma.friendsMapUser.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      }
    });;

    return res.json({ friends, message: "friends found" });
  } catch (e) {
    console.log("error in get friends ", e);
    return res.status(500).json({ message: "something went wrong" })
  }
  
};
