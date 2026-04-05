import { type RedisClientType, createClient } from "redis";
import { userManager, bodmasgameManager } from "@repo/ws-backend/ws-backend";
import { BodmasGamePlayerScalarFieldEnum } from "../../db/generated/prisma/internal/prismaNamespace";
import type { User } from "@repo/types/types";

class RedisManager {
  private static instance: RedisManager;
  private client: RedisClientType;
  private subscriber: RedisClientType;
  private publisher: RedisClientType;

  private constructor() {
    this.client = createClient();
    this.subscriber = createClient();
    this.publisher = createClient();

    this.init();
  }

  init = async () => {
    await this.client.connect();
    await this.publisher.connect();
    await this.subscriber.connect();
  };

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  subscribe = async (userId: string, key: string) => {
    await this.subscriber.subscribe(key, (message, channel) => {
      const parsedData = JSON.parse(message);

      if (channel === "online_users") {
        const isOnlineType = parsedData.type === "online_users";
        const users = userManager.users;
        if (
          parsedData.type === "online_users" ||
          parsedData.type === "BODMAS_GAME_REQUEST"
        ) {
          if (isOnlineType) {
            users.forEach((usr) => {
              if (!usr.ws || usr.status !== "IDOL") return;

              usr.ws.send(
                JSON.stringify({
                  type: parsedData.type,
                  payload: { users: users },
                }),
              );
            });
          } else {
            users.forEach((usr) => {
              if (!usr.ws || usr.status !== "IDOL") return;
              if (usr.id === parsedData.payload.from.id) return;
              usr.ws.send(message);
            });
          }
        } else if (
          parsedData.type === "FRIEND_REQUEST_SEND" ||
          parsedData.type === "FRIEND_REQUEST_ACCEPT"
        ) {
          const { to } = parsedData.payload;

          const user = users.find((usr) => usr.id === to);
          if (!user || !user.ws) return;

          user.ws.send(message);
        }
      } else if (channel.includes("bodmas:game:")) {
        const gameId = channel.split("bodmas:game:")[1];
        if (!gameId) return;

        const game = bodmasgameManager.games.get(gameId);
        if (!game) return;

        const users: User[] = [];

        game.players.map((plr) => {
          const user = userManager.users.find((usr) => usr.id === plr.id);
          if (user) users.push(user);
        });

        users.forEach((usr) => {
          if (!usr.ws) return;
          usr.ws.send(message);
        });
      }
    });
  };

  publish = async (channel: string, message: any) => {
    await this.publisher.publish(channel, JSON.stringify(message));
  };

  unsubscribe = async (userId: string, channel: string) => {
    await this.subscriber.unsubscribe(channel);
  };

  lock = async (key: string, value: string) => {
    return this.client.SETNX(key, value);
  };

  set = async (key: string, data: any, ttl?: number) => {
    if (ttl) {
      await this.client.SETEX(key, ttl, data);
    } else {
      await this.client.set(key, JSON.stringify(data));
    }
  };

  get = async (key: string) => {
    const data = await this.client.get(key);
    if (data) return JSON.parse(data);
    return null;
  };

  del = async (key: string) => {
    await this.client.del(key);
  };

  releaseLock = async (key: string) => {
    await this.client.DEL(key);
  };
}

export const redisManager = RedisManager.getInstance();
