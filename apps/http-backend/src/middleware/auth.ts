import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@repo/common/common";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1]!;

    req.user = verifyToken(token);
    next();
  } catch (e) {
    console.log("auth error ", e);
    return res.status(401).json({
      message: "bearer token not found",
    });
  }
};
