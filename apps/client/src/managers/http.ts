"use client";

import axios from "axios";
import {
  AcceptFriendReqSchema,
  CreateGameSchema,
  FriendReqSchema,
  RegisterSchemaInput,
  acceptFriendReqSchema,
  friendReqSchema,
  registerSchema,
  zodErrorMessage,
} from "@repo/types/types";
import { toast } from "sonner";

const HTTP_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://games-http-be.amitesh.work";

export const httpApis = {
  register: async (
    input: RegisterSchemaInput,
    handleSuccess: (token: string, username: string, userId: string) => void,
  ) => {
    const { success, data, error } = registerSchema.safeParse(input);

    if (!success) {
      toast.error(zodErrorMessage({ error }));
      return;
    }

    const res = await axios.post(`${HTTP_URL}/register`, data, {
      validateStatus: () => true,
    });

    if (res.status <= 201) {
      toast.success(res.data.message ?? "Registration successfull");
      handleSuccess(res.data.token, res.data.username, res.data.userId);
      return;
    }

    toast.error(res.data.message ?? "something went wrong");
  },

  sendFriendReq: async (
    input: FriendReqSchema,
    token: string,
    handleSuccess: () => void,
  ) => {
    const { success, data, error } = friendReqSchema.safeParse(input);

    if (!success) {
      toast.error(zodErrorMessage({ error }));
      return false;
    }

    const res = await axios.post(`${HTTP_URL}/friend-request/send`, data, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (res.status <= 201) {
      toast.success(res.data.message ?? "Registration successfull");
      handleSuccess();
      return true;
    }

    toast.error(res.data.message ?? "something went wrong");
    return false;
  },

  acceptFriendReq: async (input: AcceptFriendReqSchema, token: string) => {
    const { success, data, error } = acceptFriendReqSchema.safeParse(input);

    if (!success) {
      toast.error(zodErrorMessage({ error }));
      return false;
    }

    const res = await axios.put(`${HTTP_URL}/friend-request/accept`, data, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (res.status <= 201) {
      toast.success(res.data.message ?? "Registration successfull");
      return true;
    }

    toast.error(res.data.message ?? "something went wrong");
    return false;
  },

  getToken: async () => {
    const res = await axios.get(`${HTTP_URL}/token`);
  },

  getProfile: async (token: string, username: string) => {
    const res = await axios.get(`${HTTP_URL}/profile/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    });

    if (res.status <= 201) return res.data;

    return null;
  },

  getFriends: async (token: string) => {
    const res = await axios.get(`${HTTP_URL}/friends`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    });

    if (res.status <= 201) return res.data.friends;

    return null;
  },

  findFriends: async (token: string, input: string) => {
    const res = await axios.get(`${HTTP_URL}/find-friends/${input}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    });

    if (res.status <= 201) return res.data.users;

    return null;
  },

  createGame: async (
    input: CreateGameSchema,
    token: string,
    handleSuccess: (gameId: string) => void,
  ) => {
    const res = await axios.post(`${HTTP_URL}/create-game`, input, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (res.status === 201) {
      handleSuccess(res.data.gameId);
      return;
    }

    toast.error(res.data.message ?? "something went wrong");
  },

  deleteGame: async (gameId: string, token: string) => {
    const res = await axios.delete(`${HTTP_URL}/game/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (res.status === 200) return true;

    return false;
  },

  getGame: async (gameId: string, token: string) => {
    const res = await axios.get(`${HTTP_URL}/game/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (res.status === 200) return res.data;

    return null;
  },

  getResults: async (gameId: string, token: string) => {
    const res = await axios.get(`${HTTP_URL}/game/results/${gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (res.status === 200) return res.data;

    return null;
  },

  getUsersCount: async () => {
    const res = await axios.get(`${HTTP_URL}/total-users`, {
      validateStatus: () => true,
    });

    if (res.status === 200) return res.data.totalUsers;

    return null;
  },
};
