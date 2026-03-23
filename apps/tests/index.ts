import axios from "axios";

export const HTTP_URL = "http://localhost:3000/api/v1";

export const createUser = async () => {
  const data = {
    email: Math.random() + "@gmail.com",
    password: String(Math.random()),
  };

  await axios.post(`${HTTP_URL}/register`, data);

  return data;
};
