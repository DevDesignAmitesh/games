import { zodErrorMessage, type ValidateInput } from "@repo/types/types";
import type { Request, Response, NextFunction } from "express";

export const validate = (input: ValidateInput) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (input.type.includes("body")) {
        const parsed = input.schema.safeParse(req.body);
        if (!parsed.success) throw parsed.error;
        req.body = parsed.data;
      }

      if (input.type.includes("params")) {
        const parsed = input.schema.safeParse(req.params);
        if (!parsed.success) throw parsed.error;
        req.params = parsed.data as any;
      }

      if (input.type.includes("query")) {
        const parsed = input.schema.safeParse(req.query);
        if (!parsed.success) throw parsed.error;
        req.query = parsed.data as any;
      }

      next();
      // we can give it type of zodError but then have to install another dependecy in
      // this http backend folder
    } catch (error: any) {
      console.log("zod error", zodErrorMessage({ error }));
      return res.status(403).json({
        message: "invalid inputs",
      });
    }
  };
};
