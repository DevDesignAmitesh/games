import { type RedisClientType, createClient } from "redis";
import { userManager, bodmasgameManager } from "@repo/ws-backend/ws-backend";

const REDIS_URL = process.env.REDIS_URL!;

class RedisManager {
  private static instance: RedisManager;
  private client: RedisClientType;
  private subscriber: RedisClientType;
  private publisher: RedisClientType;

  private constructor() {
    this.client = createClient({
      url: REDIS_URL,
    });
    this.subscriber = createClient({
      url: REDIS_URL,
    });
    this.publisher = createClient({
      url: REDIS_URL,
    });
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
    const users = userManager.users;
    const games = bodmasgameManager.games;
    
    await this.subscriber.subscribe(room, (message, channel) => {
      const parsedData = JSON.parse(message);

      const { type, payload } = parsedData;

      console.log("channel ", channel);

      if (room === "room:online_users") {
        if (type === "online_users") {
          console.log("users length ", users.length);

          users.forEach((usr) => {
            if (!usr.ws || usr.status !== "IDOL") return;

            console.log("sending to users")
            
            usr.ws.send(
              JSON.stringify({
                type,
                payload: {
                  users,
                },
              }),
            );
          });
        } else if (type === "BODMAS_GAME_REQUEST") {
          const { from } = payload;

          users.forEach((usr) => {
            if (!usr || !usr.ws || usr.id === from.id) return;
            usr.ws.send(message);
          });
        }
      }

      if (room.startsWith("room:user:")) {
        const userId = room.split("room:user:")[1];
        const user = users.find((u) => u.id === userId);

        if (!user?.ws) return;

        user.ws.send(message);
      }

      if (room.startsWith("room:game:")) {
        const gameId = channel.split("room:game:")[1];
        if (!gameId) return;

        const game = games.get(gameId);
        if (!game) return;

        console.log("games players length ", game.players.length);
        
        game.players.forEach((plr) => {
          const user = users.find((usr) => usr.id === plr.id);
          if (!user || !user.ws) return;
          console.log("sending to game players");
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
