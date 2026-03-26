import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@repo/common/common";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("extracting token from headers")
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      console.log("bearer token not found");
      throw "bearer token not found"
    };
    
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log("error while verifying token")
      throw "error while verifying token"
    };

    req.user = decoded;
    console.log("middleware passed");
    next();
  } catch (e) {
    console.log("auth error ", e);
    return res.status(401).json({
      message: "bearer token not found",
    });
  }
};
