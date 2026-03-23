import { describe, it, expect } from "bun:test";
import axios from "axios";
import { createUser, HTTP_URL } from "..";

const user1 = await createUser();
const user2 = await createUser();

describe("POST /friend-request/send", () => {
  it("this will create a pending request in the db", async () => {
    const res = await axios.post(
      `${HTTP_URL}/friend-request/send`,
      { to: user2.userId },
      { headers: { Authorization: `Bearer ${user1.token}` } },
    );

    expect(res.status).toBe(201);
    expect(res.data.message).toBe("friend request sent successfully");
  });

  it("this return friend request already exists", async () => {
    const res = await axios.post(
      `${HTTP_URL}/friend-request/send`,
      { to: user2.userId },
      { headers: { Authorization: `Bearer ${user1.token}` } },
    );

    expect(res.status).toBe(400);
    expect(res.data.message).toBe("friend request already exists");
  });

  it("this return other user not found", async () => {
    const res = await axios.post(
      `${HTTP_URL}/friend-request/send`,
      { to: "jibhriii" },
      { headers: { Authorization: `Bearer ${user1.token}` } },
    );

    expect(res.status).toBe(404);
    expect(res.data.message).toBe("other user not found");
  });

  it("this return bearer token not found", async () => {
    const res = await axios.post(`${HTTP_URL}/friend-request/send`, {
      to: "jibhriii",
    });

    expect(res.status).toBe(401);
    expect(res.data.message).toBe("bearer token not found");
  });
});

describe("POST /friend-request/accept", () => {
  it("this will accept the friend request", async () => {
    const res = await axios.put(
      `${HTTP_URL}/friend-request/accept`,
      { to: user1.userId },
      { headers: { Authorization: `Bearer ${user2.token}` } },
    );

    expect(res.status).toBe(200);
    expect(res.data.message).toBe("friend request accepted");
  });

  it("this will return friend request already accepted", async () => {
    const res = await axios.put(
      `${HTTP_URL}/friend-request/accept`,
      { to: user1.userId },
      { headers: { Authorization: `Bearer ${user2.token}` } },
    );

    expect(res.status).toBe(400);
    expect(res.data.message).toBe("friend request already accepted");
  });

  it("this will return other user not found", async () => {
    const res = await axios.put(
      `${HTTP_URL}/friend-request/accept`,
      { to: "jibrishhhh" },
      { headers: { Authorization: `Bearer ${user2.token}` } },
    );

    expect(res.status).toBe(400);
    expect(res.data.message).toBe("friend request already accepted");
  });

  it("this will return auth error", async () => {
    const res = await axios.put(`${HTTP_URL}/friend-request/accept`, {
      to: user1.userId,
    });

    expect(res.status).toBe(401);
    expect(res.data.message).toBe("bearer token not found");
  });
});

describe("POST /friend-request/send", () => {
  it("this return you are already friends", async () => {
    const res = await axios.post(
      `${HTTP_URL}/friend-request/send`,
      { to: user2.userId },
      { headers: { Authorization: `Bearer ${user1.token}` } },
    );

    expect(res.status).toBe(400);
    expect(res.data.message).toBe("you are already friends");
  });
});
