"use client";

import { ResultCard } from "@/components/resultcard";
import { httpApis } from "@/managers/http";
import { Result } from "@/managers/ws";
import { User } from "@repo/types/types";
import { useEffect, useState } from "react";

const ResultPage = ({ gameId }: { gameId: string }) => {
  const [player1, setPlayer1] = useState<{ user: User; result: Result } | null>(
    null,
  );
  const [player2, setPlayer2] = useState<{ user: User; result: Result } | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await httpApis.getResults(gameId, token);

      if (!res) return;

      setPlayer1(res.player1);
      setPlayer2(res.player2);
    })();
  }, []);

  return (
    <div className="w-full h-screen bg-neutral-900 flex justify-center items-center">
      <ResultCard
        player1={{
          name: player1?.user.username ?? "",
          score: player1?.result.correctAnswers ?? 0,
          correct: player1?.result.correctAnswers ?? 0,
          wrong: player1?.result.incorrectAnswers ?? 0,
        }}
        player2={{
          name: player2?.user.username ?? "",
          score: player1?.result.correctAnswers ?? 0,
          correct: player1?.result.correctAnswers ?? 0,
          wrong: player1?.result.incorrectAnswers ?? 0,
        }}
      />
    </div>
  );
};

export default ResultPage;
