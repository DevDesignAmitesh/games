"use client";

import axios from "axios";
import {
  RegisterSchemaInput,
  registerSchema,
  zodErrorMessage,
} from "@repo/types/types";
import { toast } from "sonner";

const HTTP_URL = "http://localhost:4000";

export const httpApis = {
  register: async (
    input: RegisterSchemaInput,
    handleSuccess: (token: string) => void,
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
      handleSuccess(res.data.token);
      return;
    }

    toast.error(res.data.message ?? "something went wrong");
  },

  getToken: async () => {
    const res = await axios.get(`${HTTP_URL}/token`);
  },

  getProfile: async (TOKEN: string) => {
    const res = await axios.get(`${HTTP_URL}/profile`, {
      headers: {
        Authorization: TOKEN,
      },
    });

    console.log(res);
    
    if (res.status <= 201) return res.data;
    
    return null;
  },
};
