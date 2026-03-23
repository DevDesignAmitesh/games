import { describe, expect, it } from "bun:test";
import axios from "axios";
import { createUser, HTTP_URL } from "..";

describe("POST /register", () => {
  it("this should pass with status 201 and jwt token.", async () => {
    const res = await axios.post(`${HTTP_URL}/register`, {
      email: Math.random() + "@gmail.com",
      password: String(Math.random()),
    });

    expect(res.status).toBe(201);
    expect(res.data.token).toBeDefined();
    expect(res.data.userId).toBeDefined();
  });

  it("this should return invalid input", async () => {
      const res = await axios.post(`${HTTP_URL}/register`, {
        email: Math.random(),
        password: "na",
      }, {
        validateStatus: () => true
      });

      expect(res.status).toBe(403);
      expect(res.data.message).toBe("invalid inputs");
  });

  it("this should return password is wrong", async () => {
    const { email } = await createUser();

    const res = await axios.post(`${HTTP_URL}/register`, {
      email,
      password: "ladlee meoww",
    }, {
      validateStatus: () => true
    });

    expect(res.status).toBe(411);
    expect(res.data.message).toBe("wrong password");
  });
});
