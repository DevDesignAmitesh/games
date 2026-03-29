import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getFriends = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;

    const friends = await prisma.friendsMapUser.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: { receiver: true, sender: true },
    });

    const dataTosend = friends.map((frnd) => ({
      otherName:
        frnd.receiverId === userId
          ? frnd.sender.userName
          : frnd.receiver.userName,
      canAccept: frnd.receiverId === userId,
      otherId: frnd.receiverId === userId ? frnd.sender.id : frnd.receiver.id,
      status: frnd.status,
    }));

    return res.json({ friends: dataTosend, message: "friends found" });
  } catch (e) {
    console.log("error in get friends ", e);
    return res.status(500).json({ message: "something went wrong" });
  }
};
