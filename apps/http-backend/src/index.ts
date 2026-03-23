import express from "express";
import { auth } from "./middleware/auth";
import { validate } from "./middleware/validate";
import {
  acceptFriendReqSchema,
  createGameSchema,
  friendReqSchema,
  registerSchema,
} from "@repo/types/types";
import { register } from "./services/register";
import { sendReq } from "./services/sendReq";
import { acceptReq } from "./services/acceptReq";
import { createGame } from "./services/createGame";
import { getAdminGame } from "./services/getAdminGame";
import { getFriends } from "./services/getFriends";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

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

app.get("/admin-games", auth, getAdminGame);

app.get("/friends", auth, getFriends);

app.listen(PORT, () => console.log("code is running at ", PORT));
