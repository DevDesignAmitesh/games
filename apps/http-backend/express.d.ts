import type { TokenPayload } from "./src/jwt";

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}
