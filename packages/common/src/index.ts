import { sign, verify } from "jsonwebtoken";
import type { TokenPayload } from "@repo/types/types";

const secret = process.env.JWT_SECRET!;

export const signToken = (payload: TokenPayload) => {
  return sign(payload, secret);
};

// TODO: this should be in try catch
export const verifyToken = (token: string) => {
  return verify(token, secret) as TokenPayload
};
