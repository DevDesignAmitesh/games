"use client";

import { User } from "@repo/types/types";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type WSContextType = {
  liveUsers: User[];
};

const WebSocketContext = createContext<WSContextType | null>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const WS_URL = "ws://localhost:8080";
  const hasConnected = useRef(false);
  
  const [liveUsers, setLiveUsers] = useState<User[]>([]);
  
  useEffect(() => {
    if (hasConnected.current) return;
    
    const TOKEN = localStorage.getItem("token");
    console.log("connecting to ws");

    hasConnected.current = true;
    const ws = new WebSocket(`${WS_URL}?token=${TOKEN}`);
    wsRef.current = ws;

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
      console.log("ws is closed")
      ws.close()
    }
    
  }, []);

  return (
    <WebSocketContext.Provider value={{ liveUsers }}>
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
