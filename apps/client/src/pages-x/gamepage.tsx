"use client";

import { GreenInput } from "@/components/inputs";
import { httpApis } from "@/managers/http";
import { BodmasQuestion, Result, useWsContext } from "@/managers/ws";
import { User } from "@repo/types/types";
import { useCallback, useEffect, useMemo, useState } from "react";

const GamePage = ({ gameId }: { gameId: string }) => {
  const [answer, setAnswer] = useState<string>("");
  const [ansStatus, setAnsStatus] = useState<"correct" | "wrong" | "default">(
    "default",
  );
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);

  const { question, players, timeLimit, ws, results } = useWsContext();

  const userId = useMemo(() => localStorage.getItem("userId"), []);

  const isMe = (id: string) => id === userId;

  const me = players.find((p) => isMe(p.id)) ?? null;
  const opponent = players.find((p) => !isMe(p.id)) ?? null;

  const meResults = results.find((r) => isMe(r.userId)) ?? null;
  const oppsResults = results.find((r) => !isMe(r.userId)) ?? null;

  const [restData, setRestData] = useState<{
    question: BodmasQuestion | null;
    me: User | null;
    opponent: User | null;
    meResult: Result | null;
    oppsResult: Result | null;
    timeLimit: number;
  }>({
    question: null,
    me: null,
    opponent: null,
    meResult: null,
    oppsResult: null,
    timeLimit: 0,
  });

  const getInitial = useCallback(
    (name: string) => name.charAt(0).toUpperCase(),
    [me, opponent],
  );

  const compareAnswer = (input: string) => {
    const userAns = Number(input.trim());
    if (userAns === correctAnswer) {
      ws?.send(
        JSON.stringify({
          type: "BODMAS_GAME_ANSWER",
          payload: {
            questionId: question?.id,
            gameId,
            answer: Number(userAns),
          },
        }),
      );
      setAnsStatus("correct");
    }
    if (userAns !== correctAnswer) setAnsStatus("wrong");
    if (!userAns.toString().length) setAnsStatus("default");

    setAnswer(input);
  };

  const statusUI = useMemo(() => {
    switch (ansStatus) {
      case "correct":
        return { icon: "✅" };
      case "wrong":
        return { icon: "❌" };
      default:
        return { icon: "❔" };
    }
  }, [ansStatus]);

  const { icon } = statusUI;

  const [endTime, setEndTime] = useState<number | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(endTime ?? 0);

  useEffect(() => {
    if (!timeLimit) return;

    // assume timeLimit is timestamp from server
    setEndTime(timeLimit.valueOf());
  }, [timeLimit]);

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  useEffect(() => {
    setCorrectAnswer(question!.answer);
  }, [question]);

  useEffect(() => {
    const q = question ?? restData.question;
    if (!q) return;

    setCorrectAnswer(q.answer);
  }, [question, restData.question]);

  // TODO: go slowly and read the whole codee.... and then slove it properlyyy

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await httpApis.getGame(gameId, token);

      if (!res) return;

      console.log("data from get game ", res);

      setRestData(res);
    })();
  }, [gameId]);

  const finalQuestion = question ?? restData.question;
  const finalMe = me ?? restData.me;
  const finalOpponent = opponent ?? restData.opponent;
  const finalMeResult = meResults ?? restData.meResult;
  const finalOppResult = oppsResults ?? restData.oppsResult;

  return (
    <div className="w-full h-screen bg-neutral-900 flex justify-center items-center">
      <div className="w-full h-full max-w-md mx-auto flex flex-col justify-center items-center">
        {/* header */}
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-full max-w-md flex justify-between items-center px-6 py-4">
            {/* LEFT PLAYER */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-2">
                {/* avatar */}
                <div className="w-10 h-10 rounded-md bg-purple-600 flex items-center justify-center text-white font-semibold">
                  {getInitial(finalMe?.username ?? "R")}
                </div>

                {/* name + rating */}
                <div className="flex flex-col leading-tight">
                  <p className="text-sm text-white font-medium">
                    {finalMe?.username!}
                  </p>
                  <p className="text-xs text-neutral-400">896</p>
                </div>
              </div>

              {/* score */}
              <div className="flex justify-center items-center px-6 py-1 rounded-md bg-neutral-800 text-white text-sm">
                <p>{finalMeResult?.correctAnswers ?? 0}</p>
              </div>
            </div>

            {/* CENTER TIMER */}
            <div className="flex items-center gap-2">
              <div className="px-4 py-1 rounded-full bg-neutral-800 text-cyan-400 text-sm font-medium">
                {secondsLeft}
              </div>
            </div>

            {/* RIGHT PLAYER */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                {/* name + rating */}
                <div className="flex flex-col leading-tight text-right">
                  <p className="text-sm text-white font-medium">
                    {finalOpponent?.username}
                  </p>
                  <p className="text-xs text-neutral-400">996</p>
                </div>

                {/* avatar */}
                <div className="w-10 h-10 rounded-md border border-pink-500 flex items-center justify-center text-white font-semibold bg-neutral-700">
                  {getInitial(finalOpponent?.username ?? "R")}
                </div>
              </div>

              {/* score */}
              <div className="flex justify-center items-center px-6 py-1 rounded-md bg-neutral-800 text-white text-sm">
                <p>{finalOppResult?.correctAnswers ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
        {/* questions sections */}
        <div className="w-full py-32 relative">
          {/* pattern */}
          <div className="absolute opacity-50 z-0 inset-0 h-full w-full bg-[linear-gradient(to_right,#404040_1px,transparent_1px),linear-gradient(to_bottom,#404040_1px,transparent_1px)] bg-size-[6rem_4rem]" />

          {/* content */}
          <div className="w-full z-10 h-full flex justify-center items-center text-3xl font-semibold text-neutral-50">
            <div className="flex justify-center items-end gap-2">
              <p>{finalQuestion?.operation === "ADD" && "+"}</p>
              <div className="flex flex-col">
                <p>{finalQuestion?.operand1}</p>
                <p>{finalQuestion?.operand2}</p>
              </div>
            </div>
          </div>
        </div>

        {/* submit area */}
        <div className="w-full h-full flex justify-center items-center gap-4">
          <div className="w-full flex justify-center items-center">
            <GreenInput
              value={answer}
              onChange={(e) => compareAnswer(e.target.value)}
              placeholder="ENTER ANSWER"
              focus
            />
          </div>
          <div
            className={`px-6 py-2 rounded-md text-lg flex items-center justify-center transition-all duration-200 bg-neutral-800 text-neutral-300`}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
