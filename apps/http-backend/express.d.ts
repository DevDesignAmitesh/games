import type { TokenPayload } from "@repo/types/types";

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}
