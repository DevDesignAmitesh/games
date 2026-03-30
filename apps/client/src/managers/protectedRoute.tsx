"use client";

import { ReactNode, useEffect, useState } from "react";
import { httpApis } from "./http";
import { usePathname, useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/loadingScreen";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      if (!token || !username) {
        setLoading(false);
        router.push("/");
        return;
      }      

      const res = await httpApis.getProfile(token, username);

      if (!res) {
        setLoading(false);
        router.push("/");
        return;
      }

      if (pathName === "/") {
        router.push("/home");
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  return <>{children}</>;
};
