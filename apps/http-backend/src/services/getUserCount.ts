import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getUserCount = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
  
    return res.json({ totalUsers });

  } catch (e) {
    console.log("error in getUsersCount ", e);
    return res.status(500).json({ message: "something went wrong" })
  }
}