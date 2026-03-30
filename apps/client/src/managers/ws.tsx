"use client";

import { User } from "@repo/types/types";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type WSContextType = {
  liveUsers: User[];
  ws: WebSocket | null;
  setToken: Dispatch<SetStateAction<string | null>>;
};

const WebSocketContext = createContext<WSContextType | null>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  if (typeof window === "undefined") return;

  const wsRef = useRef<WebSocket | null>(null);
  const WS_URL = "ws://localhost:8080";
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const [liveUsers, setLiveUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!token) return;
    console.log("connecting to ws", token);

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    console.log("runningg");

    ws.onopen = () => {
      console.log("ws connected");
    };

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);

        console.log("data from ws ", parsedData);

        const { type, payload } = parsedData;

        if (type === "online_users") {
          const { users } = payload;
          setLiveUsers(users);
        }
      } catch {
        console.log("Invalid WS message");
      }
    };

    ws.onerror = (err) => {
      console.log("ws error", err);
    };

    return () => {
      console.log("ws is closed");
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      const ws = wsRef.current;

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setTimeout(() => {
      const ws = wsRef.current;

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "SUBSCRIBE_ONLINE_USERS" }));
      }
    }, 2 * 1000);

    return () => clearTimeout(interval);
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        liveUsers,
        ws: wsRef.current,
        setToken,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWsContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWsContext must be used inside WebSocketProvider");
  }
  return context;
};
