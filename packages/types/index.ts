import z, { ZodError } from "zod";
import type { WebSocket } from "ws";

export const friendReqSchema = z.object({
  to: z.uuid(),
});

export type FriendReqSchema = z.infer<typeof friendReqSchema>;

export const acceptFriendReqSchema = z.object({
  to: z.uuid(),
  status: z.enum(["PENDING", "ACCEPTED", "IGNORED"]),
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
  gameType: z.enum(["drawing", "bodmas"]),
});
export type CreateGameSchema = z.infer<typeof createGameSchema>;

export const findFriendsSchema = z.object({
  input: z.string()
});
export type FindFriendSchema = z.infer<typeof findFriendsSchema>;

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

export type User = {
  id: string;
  username: string;
  ws?: WebSocket;
  status: "IDOL" | "PLAYING" | "SEARCHING";
};

export type BodmasQuestionWithUser = {
  questionId: string;
  gameId: string;
  userId: string;
  startTime?: Date;
  orderIndex: number;
};

export type BodmasGame = {
  numberOfPlayers: number;
  status:
    | "WAITING_FOR_PLAYERS"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "EXPIRED";
  id: string;
  createdBy: string;
  endTime: Date | null;
  startTime: Date | null;
  timeLimit: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface BoadMasGame extends BodmasGame {
  players: Array<User & { joinedAt?: Date; questionCounter?: number }>;
  answers: {
    id: string;
    gameId: string;
    userId: string;
    questionId: string;
    answer: number;
    timeSpent: number;
    isCorrect: boolean;
    answeredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  questions: {
    id: string;
    operation: "ADD" | "SUB" | "MUL" | "DIV";
    operand1: number;
    operand2: number;
    answer: number;
    createdAt: Date;
  }[];
  gameQuestions: {
    questionId: string;
    gameId: string;
    userId: string;
    startTime?: Date | undefined;
    orderIndex: number;
  }[];
}

export type RedisPushData =
  | {
      type: "START_BODMAS_GAME";
      payload: {
        questionCounter: number;
        orderIndex: number;
        questions?: {
          id: string;
          operation: "ADD" | "SUB" | "MUL" | "DIV";
          operand1: number;
          operand2: number;
          answer: number;
          createdAt: Date;
        }[];
        gameId: string;
        userId: string;
        gameQuestion: {
          id: string;
          operation: "ADD" | "SUB" | "MUL" | "DIV";
          operand1: number;
          operand2: number;
          answer: number;
          createdAt: Date;
        };
        questionStartTime: Date;
      };
    }
  | {
      type: "BODMAS_GAME_ACCEPT";
      payload: {
        acceptedBy: string;
        createdBy: string;
        gameId: string;
        startTime: Date;
        endTime: Date;
      };
    }
  | {
      type: "BODMAS_GAME_ANSWER";
      payload: {
        answer: {
          id: string;
          gameId: string;
          userId: string;
          questionId: string;
          answer: number;
          timeSpent: number;
          isCorrect: boolean;
          answeredAt: Date | null;
          createdAt: Date;
          updatedAt: Date;
        };
      };
    }
  | {
      type: "TRACK_BODMAS_GAME";
      payload: {
        gameId: string;
      };
    };
