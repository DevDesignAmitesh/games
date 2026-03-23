import z, { ZodError } from "zod";

export const friendReqSchema = z.object({
  to: z.uuid(),
});

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(3),
});

export const createGameSchema = z.object({
  numberOfPlayers: z.number().min(2).max(10),
  drawTime: z.number().multipleOf(15),
  rounds: z.number().multipleOf(2),
});

type inputType = "body" | "params" | "query";

export type ValidateInput = {
  schema: z.ZodSchema;
  type: inputType[];
};

export const zodErrorMessage = ({ error }: { error: ZodError }) => {
  return error.issues
    .map((er) => `${er.path.join(".")}: ${er.message}`)
    .join(", ");
};
