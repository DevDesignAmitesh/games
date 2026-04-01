"use client";

import { LoadingScreen } from "@/components/loadingScreen";
import { ResultCard } from "@/components/resultcard";
import { httpApis } from "@/managers/http";
import { Result } from "@/managers/ws";
import { User } from "@repo/types/types";
import { useEffect, useState } from "react";

const ResultPage = ({ gameId }: { gameId: string }) => {
  const [me, setMe] = useState<(Result & { user: User }) | null>(null);
  const [opponent, setOpponent] = useState<(Result & { user: User }) | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await httpApis.getResults(gameId, token);
      if (!res) return;

      setMe(res.me);
      setOpponent(res.opponent);
    })();
  }, [gameId]);

  if (!me || !opponent) return <LoadingScreen />;

  return (
    <div className="w-full h-screen bg-neutral-900 flex justify-center items-center">
      <ResultCard
        me={{
          name: me?.user?.username ?? "",
          score: me?.correctAnswers ?? 0,
          correct: me?.correctAnswers ?? 0,
          wrong: me?.incorrectAnswers ?? 0,
        }}
        opponent={{
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
