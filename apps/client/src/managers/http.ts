"use client";

import axios from "axios";
import {
  FriendReqSchema,
  RegisterSchemaInput,
  friendReqSchema,
  registerSchema,
  zodErrorMessage,
} from "@repo/types/types";
import { toast } from "sonner";

const HTTP_URL = "http://localhost:4000";

export const httpApis = {
  register: async (
    input: RegisterSchemaInput,
    handleSuccess: (token: string, username: string) => void,
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
      handleSuccess(res.data.token, res.data.username);
      return;
    }

    toast.error(res.data.message ?? "something went wrong");
  },

  sendFriendReq: async (
    input: FriendReqSchema,
    TOKEN: string,
    handleSuccess: () => void,
  ) => {
    const { success, data, error } = friendReqSchema.safeParse(input);

    if (!success) {
      toast.error(zodErrorMessage({ error }));
      return;
    }

    const res = await axios.post(`${HTTP_URL}/friend-request/send`, data, {
      headers: { Authorization: TOKEN },
      validateStatus: () => true,
    });

    if (res.status <= 201) {
      toast.success(res.data.message ?? "Registration successfull");
      handleSuccess();
      return;
    }

    toast.error(res.data.message ?? "something went wrong");
  },

  getToken: async () => {
    const res = await axios.get(`${HTTP_URL}/token`);
  },

  getProfile: async (TOKEN: string, username: string) => {
    const res = await axios.get(`${HTTP_URL}/profile/${username}`, {
      headers: {
        Authorization: TOKEN,
      },
      validateStatus: () => true,
    });

    if (res.status <= 201) return res.data;

    return null;
  },

  findFriends: async (TOKEN: string, input: string) => {
    const res = await axios.get(`${HTTP_URL}/find-friends/${input}`, {
      headers: {
        Authorization: TOKEN,
      },
      validateStatus: () => true,
    });

    if (res.status <= 201) return res.data.users;

    return null;
  },
};
