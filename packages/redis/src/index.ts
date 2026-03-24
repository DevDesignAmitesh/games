import { type RedisClientType, createClient } from "redis";

type Channels = "online_users";

type Keys = "analytics_worker";

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

  subscribe(channel: Channels) {
    this.client.subscribe(channel, (message, channel) => {
      console.log("message in ", channel);
      console.log(message);
    });
  }

  publish(channel: Channels, message: any) {
    this.publisher.publish(channel, JSON.stringify(message));
  }

  push(key: Keys, data: any) {
    this.client.lPush(key, JSON.stringify(data));
  }

  async pop(key: Keys) {
    return await this.client.rPop(key);
  }
}

export const redisManager = RedisManager.getInstance();
