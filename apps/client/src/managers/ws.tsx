"use client";

import { User } from "@repo/types/types";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

type WSContextType = {
  liveUsers: User[];
  ws: WebSocket | null;
  setToken: Dispatch<SetStateAction<string | null>>;
  question: BodmasQuestion | null;
  results: Result[];
  endTime: Date | null;
  startTime: Date | null;
  players: User[];
};

export type BodmasQuestion = {
  id: string;
  operation: "ADD" | "SUB" | "MUL" | "DIV";
  operand1: number;
  operand2: number;
  answer: number;
  createdAt: Date;
};

export type Result = {
  gameId: string;
  id: string;
  questionId: string;
  userId: string;
  correctAnswers: number;
  incorrectAnswers: number;
};

const WebSocketContext = createContext<WSContextType | null>(null);

const WS_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "development"
    ? "ws://localhost:3002"
    : "wss://games-ws-be.amitesh.work";

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [liveUsers, setLiveUsers] = useState<User[]>([]);
  const [question, setQuestion] = useState<BodmasQuestion | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const [ws, setWs] = useState<WebSocket | null>(null);

  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) return;
    setToken(stored);
  }, []);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    setWs(ws);

    ws.onopen = () => console.log("connected");

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);

        const { type, payload } = parsedData;

        if (type === "online_users") {
          const { users } = payload;
          setLiveUsers(users);
        }

        if (type === "FRIEND_REQUEST_SEND") {
          const { from } = payload;

          toast.info(`${from.name ?? "someone"} sends you friend request`, {
            action: {
              onClick: () => router.push("/friends"),
              label: "View",
            },
          });
        }

        if (type === "FRIEND_REQUEST_ACCEPT") {
          const { from } = payload;

          toast.info(`${from.name ?? "someone"} accepts you friend request`, {
            action: {
              onClick: () => router.push("/friends"),
              label: "View",
            },
          });
        }

        if (type === "BODMAS_GAME_REQUEST") {
          const { from, gameId } = payload;

          toast.info(`${from.name ?? "someone"} wants to play a game`, {
            action: {
              onClick: () =>
                ws.send(
                  JSON.stringify({
                    type: "BODMAS_GAME_ACCEPT",
                    payload: { gameId, createdBy: from.id },
                  }),
                ),
              label: "Accept",
            },
          });
        }

        if (type === "BODMAS_GAME_ROUND_STARTED") {
          const { question, gameId } = payload;

          setQuestion(question);
          router.push(`/game/${gameId}`);
        }

        if (type === "BODMAS_GAME_DATA") {
          const { results, endTime, players, startTime } = payload;

          setEndTime(new Date(endTime));
          setStartTime(new Date(startTime));
          setResults(results);
          setPlayers(players);
        }

        if (type === "BODMAS_GAME_ANSWER") {
          const { question } = payload;

          setQuestion(question);
        }

        if (type === "BODMAS_GAME_ENDS") {
          const { gameId } = payload;
          router.push(`/game/${gameId}/result`);
        }

        if (type === "GAME_IS_FULL") {
          toast.info("Game is already accepted by someone else.");
        }
      } catch {}
    };

    ws.onerror = (err) => console.log(err);

    ws.onclose = () => {
      console.log("disconnected");
      setInterval(() => {
        setToken((prev) => prev);
      }, 3000);
    };

    return () => {
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    if (!ws) return;
    
    const interval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [ws]);

  return (
    <WebSocketContext.Provider
      value={{
        liveUsers,
        ws,
        setToken,
        question,
        players,
        results,
        startTime,
        endTime,
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
