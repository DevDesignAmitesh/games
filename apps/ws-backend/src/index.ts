import { WebSocketServer } from "ws";
import { userManager } from "./userManager";
import { verifyToken } from "@repo/common/common";
import type { WebSocket } from "ws";
import type { TokenPayload } from "@repo/types/types";
import { redisManager } from "@repo/redis/redis";

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

  redisManager.subscribe("online_users");
  
  redisManager.publish("online_users", {
    type: "online_users",
    payload: {
      users: userManager.users,
    },
  });

  redisManager.push("analytics_worker", {
    totalUsers: userManager.users,
  });

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());
  });

  ws.on("close", () => {
    console.log("connection left");
    userManager.removeUser(userId);

    redisManager.push("analytics_worker", {
      totalUsers: userManager.users,
    });
  });
});
