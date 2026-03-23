import axios from "axios";
import { describe, it, expect } from "bun:test";
import { createUser, HTTP_URL } from "..";

const user = await createUser();

describe("POST /create-game/:type", () => {
  it("this will create the game successfully", async () => {
    const data = {
      numberOfPlayers: 2,
      drawTime: 60,
      rounds: 4,
    };

    const res = await axios.post(`${HTTP_URL}/create-game/drawing`, data, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    expect(res.status).toBe(201);
    expect(res.data.message).toBe("game created successfully");
    expect(res.data.gameId).toBeDefined();
  });

  it("this will return invalid inputs", async () => {
    const data = {
      numberOfPlayers: 1000,
      drawTime: 22,
      rounds: 1,
    };

    const res = await axios.post(`${HTTP_URL}/create-game/choco`, data, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    expect(res.status).toBe(411);
    expect(res.data.message).toBe("invalid inputs");
  });

  it("this will return auth error", async () => {
    const data = {
      numberOfPlayers: 1,
      drawTime: 22,
      rounds: 1,
    };

    const res = await axios.post(`${HTTP_URL}/create-game/drawing`, data);

    expect(res.status).toBe(401);
    expect(res.data.message).toBe("bearer token not found");
  });
});

describe("GET /admin-games", () => {
  it("it will return auth error", async () => {
    const res = await axios.get(`${HTTP_URL}/admin-games`);

    expect(res.status).toBe(401);
    expect(res.data.message).toBe("bearer token not found");
  });

  it("it will return all the admin games", async () => {
    const res = await axios.get(`${HTTP_URL}/admin-games`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    expect(res.data.games).toBeArray();
    expect(res.status).toBe(200);
    expect(res.data.message).toBe("games found");
  });
});

describe("GET /friends", () => {
  it("it will return auth error", async () => {
    const res = await axios.get(`${HTTP_URL}/friends`);

    expect(res.status).toBe(401);
    expect(res.data.message).toBe("bearer token not found");
  });

  it("it will return all the friends", async () => {
    const res = await axios.get(`${HTTP_URL}/friends`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    expect(res.data.friends).toBeArray();
    expect(res.status).toBe(200);
    expect(res.data.message).toBe("friends found");
  });
});
