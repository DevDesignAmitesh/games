import { describe, it, expect } from "bun:test";
import axios from "axios";
import { createUser, HTTP_URL } from "..";

const user1 = await createUser();
const user2 = await createUser();
const user3 = await createUser();

describe("POST /friend-request/send", () => {
  it("this will create a pending request in the db", async () => {
    const res = await axios.post(
      `${HTTP_URL}/friend-request/send`,
      { to: user2.userId },
      { headers: { Authorization: `Bearer ${user1.token}` } },
    );

    expect(res.status).toBeOneOf([200, 201]);
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
    const status = "ACCEPTED";
    const res = await axios.put(
      `${HTTP_URL}/friend-request/accept`,
      { to: user1.userId, status },
      { headers: { Authorization: `Bearer ${user2.token}` } },
    );

    expect(res.status).toBe(200);
    expect(res.data.message).toBe(`friend request successfully ${status}`);
  });

  it("this will return friend request already accepted", async () => {
    const status = "ACCEPTED";
    const res = await axios.put(
      `${HTTP_URL}/friend-request/accept`,
      { to: user1.userId, status },
      { headers: { Authorization: `Bearer ${user2.token}` } },
    );

    expect(res.status).toBe(400);
    expect(res.data.message).toBe("friend request already accepted");
  });

  it("this will return friend request not found", async () => {
    const status = "ACCEPTED";
    const res = await axios.put(
      `${HTTP_URL}/friend-request/accept`,
      { to: user3.userId, status },
      { headers: { Authorization: `Bearer ${user2.token}` } },
    );

    expect(res.status).toBe(400);
    expect(res.data.message).toBe("friend request not found");
  });

  it("this will return other user not found", async () => {
    const status = "ACCEPTED";
    const res = await axios.put(
      `${HTTP_URL}/friend-request/accept`,
      { to: "jibrishhhh", status },
      { headers: { Authorization: `Bearer ${user2.token}` } },
    );

    expect(res.status).toBe(400);
    expect(res.data.message).toBe("friend request already accepted");
  });

  it("this will return auth error", async () => {
    const status = "ACCEPTED";
    const res = await axios.put(`${HTTP_URL}/friend-request/accept`, {
      to: user1.userId,
      status
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
