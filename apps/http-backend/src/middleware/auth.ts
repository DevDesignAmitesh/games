import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@repo/common/common";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    
    if (!token) throw "bearer token not found"
    
    const decoded = verifyToken(token);

    if (!decoded) throw "error while verifying token"

    req.user = decoded;
    next();
  } catch (e) {
    console.log("auth error ", e);
    return res.status(401).json({
      message: "bearer token not found",
    });
  }
};
