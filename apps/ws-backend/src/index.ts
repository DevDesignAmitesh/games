import { WebSocketServer } from "ws";
import { userManager } from "./userManager";
import { verifyToken } from "@repo/common/common";
import type { WebSocket } from "ws";
import type { TokenPayload } from "@repo/types/types";
import { redisManager } from "@repo/redis/redis";
import { prisma } from "@repo/db/db";
import { bodmasgameManager } from "./gameManager";

const server = new WebSocketServer({ port: 8080 });

type ExtendedWs = WebSocket & {
  user: TokenPayload;
};

server.on("connection", (ws: ExtendedWs, req) => {
  ws.on("error", console.error);

  console.log("connection done");

  const token = req.url?.split("?token=")[1];

  if (!token) {
    ws.close();
    return;
  }

  const userId = verifyToken(token).userId;

  ws.user.userId = userId;
  userManager.addUser({
    status: "IDOL",
    ws,
    id: userId,
  });

  redisManager.subscribe("online_users", userManager.users);

  redisManager.publish("online_users", {
    payload: {
      type: "online_users",
      users: userManager.users,
    },
  });

  redisManager.push("analytics_worker", {
    totalUsers: userManager.users,
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

      const sender = userManager.users.find((usr) => usr.id === ws.user.userId);
      const receiver = userManager.users.find((usr) => usr.id === to);

      if (!receiver) return;
      if (!sender) return ws.close();

      const senderFromDb = await prisma.user.findFirst({
        where: { id: sender.id },
        select: { userName: true },
      });

      if (!senderFromDb) return ws.close();

      redisManager.publish("online_users", {
        payload: {
          type: parsedData.type,
          to,
          from: { name: senderFromDb.userName },
        },
      });
    }

    if (parsedData.type === "PLAY_BODMAS_GAME") {
      const { gameId } = parsedData.payload;

      const requestedBy = userManager.users.find(
        (usr) => usr.id === ws.user.userId,
      );

      if (!requestedBy) return ws.close();

      userManager.update(requestedBy.id, { status: "SEARCHING" });

      const game = await prisma.bodmasGame.findFirst({
        where: { id: gameId },
      });

      if (!game) return ws.close();

      bodmasgameManager.createGame({
        ...game,
        answers: [],
        questions: [],
        users: [{ ...requestedBy, joinedAt: new Date() }],
      });

      redisManager.subscribe(`bodmas:game:${game.id}`, [requestedBy]);
      redisManager.publish("online_users", {
        type: parsedData.type,
        requestedBy: requestedBy.id,
      });
    }

    if (parsedData.type === "ACCEPT_BODMAS_GAME") {
    }
  });

  ws.on("close", () => {
    console.log("connection left");
    userManager.removeUser(userId);

    redisManager.publish("online_users", {
      type: "online_users",
      payload: {
        users: userManager.users,
      },
    });

    redisManager.push("analytics_worker", {
      totalUsers: userManager.users,
    });
  });
});
