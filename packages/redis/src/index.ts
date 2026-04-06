import { type RedisClientType, createClient } from "redis";
import { userManager, bodmasgameManager } from "@repo/ws-backend/ws-backend";
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
  }

  init = async () => {
    await this.client.connect();
    await this.publisher.connect();
    await this.subscriber.connect();
  };

  public static async getInstance(): Promise<RedisManager> {
    if (!RedisManager.instance) {
      const instance = new RedisManager();
      await instance.init();

      RedisManager.instance = instance;
    }
    return RedisManager.instance;
  }

  // room:online_users
  // room:user:userId (to)
  // room:game:gameId (running game)
  subscribe = async (room: string) => {
    await this.subscriber.subscribe(room, (message, channel) => {
      const parsedData = JSON.parse(message);

      const { type, payload } = parsedData;

      console.log("channel ", channel);

      if (room === "room:online_users") {
        if (type === "online_users") {
          userManager.users.forEach((usr) => {
            if (!usr.ws || usr.status !== "IDOL") return;

            usr.ws.send(
              JSON.stringify({
                type,
                payload: {
                  users: userManager.users,
                },
              }),
            );
          });
        } else if (type === "BODMAS_GAME_REQUEST") {
          const { from } = payload;

          userManager.users.forEach((usr) => {
            if (!usr || !usr.ws || usr.id === from.id) return;
            usr.ws.send(message);
          });
        }
      }

      if (room.startsWith("room:user:")) {
        const userId = room.split("room:user:")[1];
        const user = userManager.users.find((u) => u.id === userId);

        if (!user?.ws) return;

        user.ws.send(message);
      }

      if (room.startsWith("room:game:")) {
        const gameId = channel.split("room:game:")[1];
        if (!gameId) return;

        const game = bodmasgameManager.games.get(gameId);
        if (!game) return;

        game.players.forEach((plr) => {
          const user = userManager.users.find((usr) => usr.id === plr.id);
          if (!user || !user.ws) return;
          console.log("sending gamea related message", game.players.length);
          user.ws.send(message);
        });
      }
    });
  };

  publish = async (room: string, message: any) => {
    await this.publisher.publish(room, JSON.stringify(message));
  };

  unsubscribe = async (room: string) => {
    await this.subscriber.unsubscribe(room);
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
}

export const redisManager = await RedisManager.getInstance();
