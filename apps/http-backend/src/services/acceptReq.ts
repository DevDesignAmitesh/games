import type { Request, Response } from "express";
import { type AcceptFriendReqSchema } from "@repo/types/types";
import { prisma } from "@repo/db/db";

export const acceptReq = async (
  req: Request<{}, {}, AcceptFriendReqSchema, {}>,
  res: Response,
) => {
  try {
    const { userId } = req.user;
    const { to, status } = req.body;
    console.log(
      "extracting req.body, req.user ",
      JSON.stringify({ ...req.user, ...req.body }),
    );

    const friendToBe = await prisma.user.findFirst({
      where: { id: to },
    });

    if (!friendToBe) {
      return res.status(404).json({ message: "other user not found" });
    }

    const isReqExist = await prisma.friendsMapUser.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: to },
          { receiverId: userId, senderId: to },
        ],
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

    console.log("updating friends req status");
    await prisma.friendsMapUser.update({
      where: { id: isReqExist.id },
      data: {
        status,
        respondedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: `friend request successfully ${status}`,
      to,
    });
  } catch (e) {
    console.log("error in sendreq ", e);
    return res.status(500).json({ message: "something went wrong" });
  }
};
