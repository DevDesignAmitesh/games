import type { RegisterSchemaInput } from "@repo/types/types";
import type { Request, Response } from "express";
import { prisma } from "@repo/db/db";
import { compareFn, hashFn } from "../bcrypt";
import { signToken } from "@repo/common/common";

export const register = async (
  req: Request<{}, {}, RegisterSchemaInput, {}>,
  res: Response,
) => {
  const { email, password } = req.body;

  const exitingUser = await prisma.user.findFirst({ where: { email } });

  if (exitingUser) {
    const isPasswordSame = await compareFn(password, exitingUser.password);

    if (!isPasswordSame) {
      return res.status(411).json({ message: "wrong password" });
    }

    const token = signToken({ userId: exitingUser.id });

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

  console.log("token ", token);
  
  return res.status(201).json({
    message: "registration done",
    token,
    userId: user.id,
  });
};
