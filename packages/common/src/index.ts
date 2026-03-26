import { sign, verify } from "jsonwebtoken";
import type { TokenPayload } from "@repo/types/types";

const secret = process.env.JWT_SECRET!;

export const signToken = (payload: TokenPayload) => {
  try {
    return sign(payload, secret);
  } catch (e) {
    console.log("error while signing token ", e);
    return null;
  }
};

export const verifyToken = (token: string)  => {
  try {
    return verify(token, secret) as TokenPayload
  } catch (e) {
    console.log("error while verifying token ", e);
    return null;
  }
};
