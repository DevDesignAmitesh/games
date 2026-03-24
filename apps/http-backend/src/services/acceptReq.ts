import type { Request, Response } from "express";
import { type AcceptFriendReqSchema } from "@repo/types/types";
import { prisma } from "@repo/db/db";

export const acceptReq = async (
  req: Request<{}, {}, AcceptFriendReqSchema, {}>,
  res: Response,
) => {
  const { userId } = req.user;
  const { to, status } = req.body;

  const friendToBe = await prisma.user.findFirst({
    where: { id: to },
  });

  if (!friendToBe) {
    return res.status(404).json({ message: "other user not found" });
  }

  const isReqExist = await prisma.friendsMapUser.findUnique({
    where: {
      receiverId_senderId: {
        receiverId: userId,
        senderId: to,
      },
    },
  });

  if (!isReqExist) {
    return res.status(404).json({ message: "friend request not found" });
  }

  if (isReqExist.status === "ACCEPTED") {
    return res.status(400).json({
      message: "friend request already accepted",
    });
  }

  await prisma.friendsMapUser.update({
    where: { id: isReqExist.id },
    data: {
      status,
      respondedAt: new Date(),
    },
  });

  console.log("to in accept req", to);
  
  return res.status(200).json({
    message: `friend request successfully ${status}`,
    to,
  });
};
