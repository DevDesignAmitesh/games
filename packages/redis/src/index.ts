import { type RedisClientType, createClient } from "redis";
import type { User } from "@repo/types/types";

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

  subscribe(channel: string, users: User[]) {
    console.log(users.length);

    this.client.subscribe(channel, (message, channel) => {
      if (channel === "online_users") {
        const parsedData = JSON.parse(message);

        if (parsedData.type === "online_users") {
          users.forEach((usr) => {
            usr.ws.send(
              JSON.stringify({
                type: parsedData.type,
                users,
              }),
            );
          });
        } else if (
          parsedData.type === "FRIEND_REQUEST_SEND" ||
          parsedData.type === "FRIEND_REQUEST_ACCEPT"
        ) {
          const user = users.find((usr) => usr.id === parsedData.to);
          if (!user) return;

          user.ws.send(message);
        }
      }
    });
  }

  publish(channel: string, message?: any) {
    this.publisher.publish(channel, JSON.stringify(message));
  }

  push(key: string, data: any) {
    this.publisher.lPush(key, JSON.stringify(data));
  }

  async pop(key: string) {
    return await this.client.rPop(key);
  }
}

export const redisManager = RedisManager.getInstance();
