import { prisma } from "@repo/db/db";
import type { Request, Response } from "express";

export const getResults = async (req: Request, res: Response) => {
  const { gameId } = req.params as { gameId: string | undefined }

  const results = await prisma.bodmasGameResult.findMany({
    where: { gameId },
    include: { user: true }
  });

  if (!results.length) {
    return res.status(400).json({
      message: "results not found"
    })
  }

  return res.json({ results });
}