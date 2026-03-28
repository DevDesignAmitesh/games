import type { RegisterSchemaInput } from "@repo/types/types";
import type { Request, Response } from "express";
import { prisma } from "@repo/db/db";
import { compareFn, hashFn } from "../bcrypt";
import { signToken } from "@repo/common/common";

export const register = async (
  req: Request<{}, {}, RegisterSchemaInput, {}>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;
    console.log("extracting req.body ", JSON.stringify(req.body));

    const exitingUser = await prisma.user.findFirst({ where: { email } });

    if (exitingUser) {
      console.log("existing user found");
      const isPasswordSame = await compareFn(password, exitingUser.password);

      if (!isPasswordSame) {
        return res.status(411).json({ message: "wrong password" });
      }

      console.log("password is valid generating token");

      const token = signToken({ userId: exitingUser.id });

      if (!token) throw "signed token not found";

      return res.status(200).json({
        message: "login done",
        token,
        userId: exitingUser.id,
      });
    }

    const hashedPassword = await hashFn(password);
    const userName = email.split("@")[0]!;

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, userName },
    });

    const token = signToken({ userId: user.id });

    if (!token) throw "signed token not found";

    // Set the cookie on the response
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JS access (recommended)
      secure: process.env.NODE_ENV === "production", // Use 'true' in production with HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Specific settings for cross-site
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week expiration
    });

    return res.status(201).json({
      message: "registration done",
      token,
      userId: user.id,
    });
  } catch (e) {
    console.log("error in register ", e);
    return res.status(500).json({
      message: "something went wrong",
    });
  }
};
