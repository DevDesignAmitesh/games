"use client";

import { useCallback, useMemo } from "react";
import { GreenButton } from "./buttons";
import { useRouter } from "next/navigation";

export const ResultCard = ({
  me,
  opponent,
}: {
  me: {
    name: string;
    score: number;
    correct: number;
    wrong: number;
  };
  opponent: {
    name: string;
    score: number;
    correct: number;
    wrong: number;
  };
}) => {
  const getInitial = useCallback(
    (name: string) => name.charAt(0).toUpperCase(),
    [],
  );

  const total1 = useMemo(() => {
    return me.correct + me.wrong;
  }, [me]);
  const total2 = useMemo(() => {
    return opponent.correct + opponent.wrong;
  }, [opponent]);

  const router = useRouter();

  return (
    <div className="flex w-full items-center justify-center text-white">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-700 bg-linear-to-br from-neutral-900 to-neutral-800 p-4 sm:p-6">
        {/* TITLE */}
        <div className="text-center mb-6">
          <h1
            className={`font-bebas text-5xl font-bold tracking-widest sm:text-6xl ${me.correct >= opponent.correct ? "text-green-400" : "text-pink-500"}`}
          >
            {me.correct >= opponent.correct ? "VICTORY" : "DEFEAT"}
          </h1>
        </div>

        {/* SCORE */}
        <div className="mb-6 flex items-center justify-between gap-3 px-2 sm:px-10">
          <p className="text-4xl font-bold text-neutral-400 sm:text-5xl">{me.score}</p>
          <p className="text-2xl text-neutral-500">-</p>
          <p className="text-4xl font-bold text-white sm:text-5xl">{opponent.score}</p>
        </div>

        {/* PLAYERS */}
        <div className="mb-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* PLAYER 1 */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 rounded-md bg-neutral-800 px-3 py-2">
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-xs">
                {getInitial(me.name)}
              </div>
              <span className="max-w-28 truncate text-sm sm:max-w-none">{me.name}</span>
            </div>
          </div>

          {/* PLAYER 2 */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 rounded-md bg-neutral-800 px-3 py-2">
              <div className="w-6 h-6 bg-neutral-700 rounded flex items-center justify-center text-xs">
                {getInitial(opponent.name)}
              </div>
              <span className="max-w-28 truncate text-sm sm:max-w-none">{opponent.name}</span>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* PLAYER 1 STATS */}
          <div className="bg-neutral-800/60 rounded-xl p-4 space-y-3">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">
              Stats
            </p>

            <div className="flex justify-between text-sm">
              <span>Correct</span>
              <span>{me.correct}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Incorrect</span>
              <span>{me.wrong}</span>
            </div>

            <div className="flex justify-between text-sm text-neutral-400">
              <span>Total</span>
              <span>{total1}</span>
            </div>
          </div>

          {/* PLAYER 2 STATS */}
          <div className="bg-neutral-800/60 rounded-xl p-4 space-y-3">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">
              Stats
            </p>

            <div className="flex justify-between text-sm">
              <span>Correct</span>
              <span>{opponent.correct}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Incorrect</span>
              <span>{opponent.wrong}</span>
            </div>

            <div className="flex justify-between text-sm text-neutral-400">
              <span>Total</span>
              <span>{total2}</span>
            </div>
          </div>
        </div>

        {/* HOME BUTTON */}
        <div className="w-full py-6 text-center">
          <GreenButton
            onClick={() => router.push("/home")}
            label="Back to home"
          />
        </div>
      </div>
    </div>
  );
};
