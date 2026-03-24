import { type RedisClientType, createClient } from "redis";
import type { User } from "@repo/types/types";
import { userManager, bodmasgameManager } from "@repo/ws-backend/ws-backend";

class RedisManager {
  private static instance: RedisManager;
  private client: RedisClientType;
  private publisher: RedisClientType;

  private constructor() {
    this.client = createClient();
    this.client.connect();
    this.publisher = createClient();
    this.publisher.connect();
  }

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  subscribe(key: string) {
    this.client.subscribe(key, (message, channel) => {
      const parsedData = JSON.parse(message);
      if (channel === "online_users") {
        const isOnlineChannel = parsedData.type === "online_users";
        if (
          parsedData.type === "online_users" ||
          parsedData.type === "PLAY_BODMAS_GAME"
        ) {
          const users = userManager.users;
          users.forEach((usr) => {
            usr.ws.send(
              JSON.stringify({
                type: parsedData.type,
                users: isOnlineChannel ? users : null,
              }),
            );
          });
        } else if (
          parsedData.type === "FRIEND_REQUEST_SEND" ||
          parsedData.type === "FRIEND_REQUEST_ACCEPT"
        ) {
          const users = userManager.users;
          const user = users.find((usr) => usr.id === parsedData.to);
          if (!user) return;

          user.ws.send(message);
        }
      } else if (channel.includes("bodmas:game:")) {
        const gameId = channel.split("bodmas:game:")[1];
        if (!gameId) return;

        const game = bodmasgameManager.games.get(gameId);
        if (!game) return;
        game.users.forEach((usr) => {
          usr.ws.send(
            JSON.stringify({
              type: parsedData.type,
            }),
          );
        });
      }
    });
  }

  publish(channel: string, message?: any) {
    this.publisher.publish(channel, JSON.stringify(message));
  }

  unsubscribe(channel: string) {
    this.client.unsubscribe(channel);
  }

  push(key: string, data: any) {
    this.publisher.lPush(key, JSON.stringify(data));
  }

  async pop(key: string) {
    return await this.client.rPop(key);
  }
}

export const redisManager = RedisManager.getInstance();
