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
    this.client.subscribe(channel, (message, channel) => {
      console.log("message in ", channel);
      console.log(message);

      //   some sending logic
      //   like

      // users.forEach((usr) => {
      //   usr.ws.send(JSON.stringify({
      //     some_data,
      //     some_data
      //   }))
      // })
    });
  }

  publish(channel: string, message?: any) {
    this.publisher.publish(channel, JSON.stringify({ type: channel, message }));
  }

  push(key: string, data: any) {
    this.client.lPush(key, JSON.stringify(data));
  }

  async pop(key: string) {
    return await this.client.rPop(key);
  }
}

export const redisManager = RedisManager.getInstance();
