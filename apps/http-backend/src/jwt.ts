import { sign, verify } from "jsonwebtoken";

const secret = process.env.JWT_SECRET!;

export type TokenPayload = {
  userId: string;
};

export const signToken = (payload: TokenPayload) => {
  return sign(payload, secret);
};

export const verifyToken = (token: string) => {
  return verify(token, secret) as TokenPayload
};
