import express from "express";
import { auth } from "./middleware/auth";
import { validate } from "./middleware/validate";
import {
  acceptFriendReqSchema,
  createGameSchema,
  findFriendsSchema,
  friendReqSchema,
  registerSchema,
} from "@repo/types/types";
import { register } from "./services/register";
import { sendReq } from "./services/sendReq";
import { acceptReq } from "./services/acceptReq";
import { createGame } from "./services/createGame";
import { getFriends } from "./services/getFriends";
import { getResults } from "./services/getResults";
import cors from "cors";
import { getProfile } from "./services/getProfile";
import { findFriends } from "./services/findFriends";
import { getGame } from "./services/getGame";
import { deleteGame } from "./services/deleteGame";
import { getUserCount } from "./services/getUserCount";

export const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://games.amitesh.work"],
  }),
);

app.get("/", (_req, res) => {
  res.json({ status: "OK" });
});

app.get("/profile/:username", auth, getProfile);

app.post(
  "/register",
  validate({
    schema: registerSchema,
    type: ["body"],
  }),
  register,
);

app.post(
  "/friend-request/send",
  auth,
  validate({
    schema: friendReqSchema,
    type: ["body"],
  }),
  sendReq,
);

app.put(
  "/friend-request/accept",
  auth,
  validate({
    schema: acceptFriendReqSchema,
    type: ["body"],
  }),
  acceptReq,
);

app.post(
  "/create-game",
  auth,
  validate({
    schema: createGameSchema,
    type: ["body"],
  }),
  createGame,
);

app.get("/friends", auth, getFriends);

app.get(
  "/find-friends/:input",
  auth,
  validate({
    schema: findFriendsSchema,
    type: ["params"],
  }),
  findFriends,
);

app.get("/game/results/:gameId", auth, getResults);

app.get("/game/:gameId", auth, getGame);

app.get("/total-users", getUserCount);

app.delete("/game/:gameId", auth, deleteGame);

