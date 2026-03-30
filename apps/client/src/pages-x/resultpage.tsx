"use client";

import { ResultCard } from "@/components/resultcard";

const ResultPage = () => {
  return (
    <div className="w-full h-screen bg-neutral-900 flex justify-center items-center">
      <ResultCard
        player1={{
          name: "amiteshsingh",
          score: 8,
          correct: 5,
          wrong: 3,
        }}
        player2={{
          name: "mayank_saini",
          score: 12,
          correct: 7,
          wrong: 2,
        }}
      />
    </div>
  );
};

export default ResultPage;
