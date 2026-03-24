import type { WebSocket } from "ws";
import { UserStatus } from "@repo/db/db";

type User = {
  id: string;
  ws: WebSocket;
  status: UserStatus;
};

class UserManager {
  private static instance: UserManager;
  users: User[] = [];

  private constructor() {}

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  addUser(user: User) {
    this.users.push(user);
  }

  removeUser(userId: string) {
    this.users = this.users.filter((usr) => usr.id !== userId);
  }
}

export const userManager = UserManager.getInstance();
