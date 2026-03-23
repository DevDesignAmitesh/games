import express from "express";
import { auth } from "./middleware/auth";
import { validate } from "./middleware/validate";
import {
  createGameSchema,
  friendReqSchema,
  registerSchema,
} from "@repo/types/types";

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
);

app.post(
  "/friend-request/send",
  auth,
  validate({
    schema: friendReqSchema,
    type: ["body"],
  }),
);

app.put(
  "/friend-request/accept",
  auth,
  validate({
    schema: friendReqSchema,
    type: ["body"],
  }),
);

app.post(
  "/create-game/:gameType",
  auth,
  validate({
    schema: createGameSchema,
    type: ["body", "params"],
  }),
);

app.get("/admin-game", auth);

app.get("/friends", auth);

app.listen(PORT, () => console.log("code is running at ", PORT));
