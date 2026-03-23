import axios from "axios";

export const HTTP_URL = "http://localhost:3000";

export const createUser = async () => {
  const data = {
    email: Math.random() + "@gmail.com",
    password: String(Math.random()),
  };

  // should return token and userId
  const res = (await axios.post(`${HTTP_URL}/register`, data)) as {
    data: { token: string; userId: string };
  };

  return { ...data, ...res.data };
};
