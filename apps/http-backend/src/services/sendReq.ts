import type { Request, Response } from "express";
import { type FriendReqSchema } from "@repo/types/types";
import { prisma } from "@repo/db/db";
import { redisManager } from "@repo/redis/redis";

export const sendReq = async (
  req: Request<{}, {}, FriendReqSchema, {}>,
  res: Response,
) => {
  try {
    const { to } = req.body;
    const { userId } = req.user;
    console.log(
      "extracting req.body and req.user ",
      JSON.stringify({ ...req.body, ...req.user }),
    );

    const friendToBe = await prisma.user.findFirst({
      where: { id: to },
    });

    if (!friendToBe) {
      return res.status(404).json({
        message: "other user not found",
      });
    }

    const alreadyFriends = await prisma.friendsMapUser.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: to },
          { receiverId: userId, senderId: to },
        ],
      },
    });

    const key = `/profile/${userId}`;
    const key2 = `/profile/${to}`;

    if (alreadyFriends) {
      if (alreadyFriends.status === "PENDING") {
        return res.status(400).json({
          message: "friend request already exists",
        });
      }

      if (alreadyFriends.status === "ACCEPTED") {
        return res.status(400).json({
          message: "friend request already exists",
        });
      }

      if (alreadyFriends.status === "IGNORED") {
        await prisma.friendsMapUser.update({
          where: { id: alreadyFriends.id },
          data: { status: "PENDING" },
        });

        redisManager.del(key);
        redisManager.del(key2);

        return res
          .status(200)
          .json({ message: "friend request sent successfully" });
      }
    }

    console.log("creating friend request");

    await prisma.friendsMapUser.create({
      data: {
        receiverId: to,
        senderId: userId,
        requestedAt: new Date(),
      },
    });

    redisManager.del(key);
    redisManager.del(key2);

    return res
      .status(201)
      .json({ message: "friend request sent successfully", to });
  } catch (e) {
    console.log("error in sendreq ", e);
    return res.status(500).json({ message: "something went wrong" });
  }
};
