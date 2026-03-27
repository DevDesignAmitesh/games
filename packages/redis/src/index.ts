import { type RedisClientType, createClient } from "redis";
import { userManager, bodmasgameManager  } from "@repo/ws-backend/ws-backend";
import { type RedisPushData } from "@repo/types/types";

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
      console.log("publishing ", message);

      
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
              if (!usr.ws) return;

              usr.ws.send(
                JSON.stringify({
                  type: parsedData.type,
                  users: users,
                }),
              );
            });
          } else {
            users.forEach((usr) => {
              if (!usr.ws) return;

              if (usr.id !== parsedData.from.id) {
                usr.ws.send(message);
              }
            });
          }
        } else if (
          parsedData.type === "FRIEND_REQUEST_SEND" ||
          parsedData.type === "FRIEND_REQUEST_ACCEPT"
        ) {
          const user = users.find((usr) => usr.id === parsedData.to);
          if (!user || !user.ws) return;

          user.ws.send(message);
        }
      } else if (channel.includes("bodmas:game:")) {
        const gameId = channel.split("bodmas:game:")[1];
        if (!gameId) return;

        const game = bodmasgameManager.games.get(gameId);
        if (!game) return;

        game.players.forEach((plr) => {
          if (!plr.ws) return;

          plr.ws.send(message);
        });
      }
    });
  }

  publish(channel: string, message: any) {
    this.publisher.publish(channel, JSON.stringify(message));
  }

  unsubscribe(channel?: string) {
    this.client.unsubscribe(channel);
  }

  push(key: string, data: RedisPushData, delay?: number) {
    this.publisher.lPush(key, JSON.stringify(data));
  }

  async pop(key: string) {
    return await this.publisher.rPop(key);    
  }

  async worker(key: string) {
  }

  async lock(key: string, value: string) {
    return this.publisher.SETNX(key, value);
  }

  releaseLock(key: string) {
    this.publisher.DEL(key);
  }
}

export const redisManager = RedisManager.getInstance();
