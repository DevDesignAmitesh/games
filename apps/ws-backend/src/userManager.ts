import type { User } from "@repo/types/types";

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

  update(userId: string, data: Partial<User>) {
    const user = this.users.find((usr) => usr.id === userId);
    if (!user) return;

    const newUser: User = { ...user, ...data };
    this.users = this.users.filter((usr) => usr.id !== userId);
    this.addUser(newUser);
  }
}

export const userManager = UserManager.getInstance();
