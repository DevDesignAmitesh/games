"use client";

import { LoadingScreen } from "@/components/loadingScreen";
import { ResultCard } from "@/components/resultcard";
import { httpApis } from "@/managers/http";
import { Result } from "@/managers/ws";
import { User } from "@repo/types/types";
import { useEffect, useState } from "react";

const ResultPage = ({ gameId }: { gameId: string }) => {
  const [me, setMe] = useState<(Result & { user: User }) | null>(
    null,
  );
  const [opponent, setOpponent] = useState<(Result & { user: User }) | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await httpApis.getResults(gameId, token);
      console.log(res);

      if (!res) return;

      console.log("res.player1");
      console.log(res.player1.user);

      setMe(res.me);
      setOpponent(res.opponent);
    })();
  }, [gameId]);

if (!me || !opponent) return <LoadingScreen />;

  return (
    <div className="w-full h-screen bg-neutral-900 flex justify-center items-center">
      <ResultCard
        player1={{
          name: me?.user?.username ?? "",
          score: me?.correctAnswers ?? 0,
          correct: me?.correctAnswers ?? 0,
          wrong: me?.incorrectAnswers ?? 0,
        }}
        player2={{
          name: opponent?.user?.username ?? "",
          score: opponent?.correctAnswers ?? 0,
          correct: opponent?.correctAnswers ?? 0,
          wrong: opponent?.incorrectAnswers ?? 0,
        }}
      />
    </div>
  );
};

export default ResultPage;
