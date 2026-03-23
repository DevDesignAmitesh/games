import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getAdminGame = async (req: Request, res: Response) => {
  const adminGames = await prisma.adminGame.findMany();

  return res.json({ games: adminGames });
};
