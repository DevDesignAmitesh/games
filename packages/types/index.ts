import z, { ZodError } from "zod";
import { FriendRequestStatus } from "@repo/db/db";

export const friendReqSchema = z.object({
  to: z.uuid(),
});

export type FriendReqSchema = z.infer<typeof friendReqSchema>;

export const acceptFriendReqSchema = z.object({
  to: z.uuid(),
  status: z.enum(FriendRequestStatus),
});

export type AcceptFriendReqSchema = z.infer<typeof acceptFriendReqSchema>;

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(3),  
});
export type RegisterSchemaInput = z.infer<typeof registerSchema>;

export const createGameSchema = z.object({
  numberOfPlayers: z.number().min(2).max(10),
  drawTime: z.number().multipleOf(15),
  rounds: z.number().multipleOf(2),
  gameType: z.enum(["drawing"])
});
export type CreateGameSchema = z.infer<typeof createGameSchema>;

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

export type TokenPayload = {
  userId: string;
};
