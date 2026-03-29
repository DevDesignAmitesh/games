"use client";

import { ReactNode, useEffect, useState } from "react";
import { httpApis } from "./http";
import { usePathname, useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/loadingScreen";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  if (typeof window === "undefined") return <LoadingScreen />;

  const [loading, setLoading] = useState(true);

  const TOKEN = localStorage.getItem("token");

  const router = useRouter();
  const pathName = usePathname();

  const username = localStorage.getItem("username")
  

  useEffect(() => {
    console.log("running");
    if (!TOKEN || !username) {
      setLoading(false);
      router.push("/");
      return;
    }

    (async () => {
      const res = await httpApis.getProfile(`Bearer ${TOKEN}`, username);

      if (!res) {
        setLoading(false);
        router.push("/");
        return;
      }

      console.log("pathName", pathName);

      if (TOKEN && pathName === "/") {
        router.push("/home");
      } else {
        router.push(pathName ?? "/home");
      }
      setLoading(false);
    })();
  }, [TOKEN, pathName]);

  if (loading) return <LoadingScreen />;

  return <>{children}</>;
};
