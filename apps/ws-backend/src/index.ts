import { WebSocketServer } from "ws";
import { userManager } from "./userManager";
import { verifyToken } from "@repo/common/common";
import type { WebSocket } from "ws";
import type { TokenPayload } from "@repo/types/types";
import { redisManager } from "@repo/redis/redis";
import { prisma } from "@repo/db/db";
import { bodmasgameManager } from "./gameManager";
import { generateRandomQuesions } from "./utils";

const server = new WebSocketServer({ port: 8081 });

type ExtendedWs = WebSocket & TokenPayload;

server.on("connection", async (ws: ExtendedWs, req) => {
  ws.on("error", console.error);

  console.log("connection done");

  const token = req.url?.split("?token=")[1];

  if (!token) {
    ws.close();
    return;
  }

  const userId = verifyToken(token).userId;

  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) {
    ws.close();
    return;
  }

  ws.userId = userId;
  userManager.addUser({
    status: "IDOL",
    ws,
    id: userId,
    username: user.userName,
  });

  redisManager.subscribe("online_users");

  redisManager.publish("online_users", {
    type: "online_users",
  });

  ws.on("ping", () => {
    ws.send(JSON.stringify({ status: "ok" }));
  });

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data.toString());

    if (
      parsedData.type === "FRIEND_REQUEST_SEND" ||
      parsedData.type === "FRIEND_REQUEST_ACCEPT"
    ) {
      const { to } = parsedData.payload;

      const sender = userManager.users.find((usr) => usr.id === ws.userId);
      const receiver = userManager.users.find((usr) => usr.id === to);

      if (!receiver) return;
      if (!sender) return ws.close();

      const senderFromDb = await prisma.user.findFirst({
        where: { id: sender.id },
        select: { userName: true, id: true },
      });

      if (!senderFromDb) return ws.close();

      redisManager.publish("online_users", {
        type: parsedData.type,
        to,
        from: { name: senderFromDb.userName, id: senderFromDb.id },
      });
    }

    if (parsedData.type === "BODMAS_GAME_REQUEST") {
      const { gameId } = parsedData.payload;

      const requestedBy = userManager.users.find((usr) => usr.id === ws.userId);

      if (!requestedBy) return ws.close();

      const requestedByFromDb = await prisma.user.findFirst({
        where: { id: ws.userId },
        select: {
          userName: true,
          id: true,
        },
      });

      if (!requestedByFromDb) return ws.close();

      userManager.update(requestedBy.id, { status: "SEARCHING" });

      const bodmasGame = await prisma.bodmasGame.findFirst({
        where: { id: gameId },
      });

      if (!bodmasGame) return ws.close();

      bodmasgameManager.create_update_game({
        ...bodmasGame,
        answers: [],
        questions: [],
        users: [{ ...requestedBy, joinedAt: new Date() }],
      });

      redisManager.subscribe(`bodmas:game:${bodmasGame.id}`);

      redisManager.publish("online_users", {
        type: parsedData.type,
        from: {
          name: requestedByFromDb.userName,
          id: requestedByFromDb.id,
        },
        gameId,
      });
    }

    if (parsedData.type === "BODMAS_GAME_ACCEPT") {
      const { gameId, createdBy } = parsedData.payload;
      const key = `bodmas:game:${gameId}`;
      const lock = await redisManager.lock(key, `${ws.userId}:${Date.now()}`);

      if (lock === 0) {
        ws.send(
          JSON.stringify({
            type: "GAME_IS_FULL",
          }),
        );
        return;
      }

      const acceptedBy = userManager.users.find((usr) => usr.id === ws.userId);
      const creator = userManager.users.find((usr) => usr.id === createdBy);
      const bodmasGame = bodmasgameManager.games.get(gameId);

      if (!acceptedBy || !creator || !bodmasGame) return ws.close();

      if (bodmasGame.createdBy !== creator.id) return;

      const bodmasGameFromDb = await prisma.bodmasGame.findFirst({
        where: { id: bodmasGame.id },
        include: { players: true },
      });

      if (!bodmasGameFromDb) {
        return ws.close();
      }

      if (bodmasGameFromDb.players.length === 2) {
        // we will use this same logic in the worker and there we will relase the lock
        ws.send(
          JSON.stringify({
            type: "GAME_IS_FULL",
          }),
        );
        return;
      }

      // idempotency ( already joined )
      if (bodmasGame.users.some((usr) => usr.id === ws.userId)) return;

      redisManager.push("bodmas:game", {
        type: parsedData.type,
        payload: {
          acceptedBy: acceptedBy.id,
          createdBy,
          gameId,
        },
      });

      userManager.update(createdBy, { status: "PLAYING" });
      userManager.update(acceptedBy.id, { status: "PLAYING" });

      bodmasgameManager.create_update_game({
        ...bodmasGame,
        startTime: new Date(),
        status: "IN_PROGRESS",
        users: [...bodmasGame.users, { ...acceptedBy, joinedAt: new Date() }],
      });

      redisManager.releaseLock(key);

      redisManager.subscribe(`bodmas:game:${bodmasGame.id}`);
      redisManager.publish(`bodmas:game:${bodmasGame.id}`, {
        type: "START_BODMAS_GAME",
      });
    }

    if (parsedData.type === "START_BODMAS_GAME") {
      const { gameId } = parsedData.payload;

      const bodmasGameFromDb = await prisma.bodmasGame.findFirst({
        where: { id: gameId },
      });
      if (!bodmasGameFromDb) return ws.close();

      const inmemoryBodmasGame = bodmasgameManager.games.get(gameId);
      if (!inmemoryBodmasGame) return ws.close();

      const counter = bodmasgameManager.getQsCounter(gameId, ws.userId) || 0;
      bodmasgameManager.setQsCounter(gameId, ws.userId, counter);
      // this counter should be updated in db's game table

      const randomQuestions = generateRandomQuesions();
      bodmasgameManager.inmemoryQuestions.set(gameId, randomQuestions);
      // these questions should also be updated in db's questions table

      const startTime = Date.now();
      const question = randomQuestions[counter]!;
      bodmasgameManager.setQsTimer(question.id, ws.userId, startTime);
      // this start time should also be updated in db's questions table

      inmemoryBodmasGame.questions.push(question);
      // these questions are alread updated in db so on memory loss will get from the db

      redisManager.publish(`bodmas:game:${inmemoryBodmasGame.id}`, {
        type: "BODMAS_GAME_ROUND_STARTED",
        question,
      });

      redisManager.push("bodmas:game", {
        type: parsedData.type,
        payload: {
          userId: ws.userId,
          gameId,
          questionCounter: counter,
          questions: randomQuestions,
          questionStartTimeWithId: {
            id: question.id,
            startTime,
          },
        },
      });
    }
  });

  ws.on("close", () => {
    console.log("connection left");
    userManager.removeUser(userId);

    redisManager.unsubscribe();

    redisManager.publish("online_users", {
      type: "online_users",
    });
  });
});

export * from "./userManager";
export * from "./gameManager";
