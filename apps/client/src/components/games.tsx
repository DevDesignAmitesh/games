"use client";

import { useState } from "react";
import { games } from "@/lib/data";
import { httpApis } from "@/managers/http";
import { useWsContext } from "@/managers/ws";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Games = () => {
  const router = useRouter();
  const { ws } = useWsContext();

  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    if (loading) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    try {
      await httpApis.createGame(
        {
          drawTime: 60,
          gameType: "bodmas",
          numberOfPlayers: 2,
          rounds: 4,
        },
        token,
        (gameId) => {
          ws?.send(
            JSON.stringify({
              type: "BODMAS_GAME_REQUEST",
              payload: { gameId },
            }),
          );

          router.push(`/game/${gameId}/search`);
        },
      );
    } catch (err) {
      console.error(err);
      setLoading(false); // reset if failed
    }
  };

  return (
    <div className="mt-10 relative">
      <h1 className="mb-5 w-full text-left font-bebas text-xl font-extrabold tracking-[0.2em] text-neutral-100 uppercase sm:text-2xl">
        ONLINE MULTIPLAYER GAMES
      </h1>

      <div
        className={`grid w-full grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 ${
          loading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {games.map((game) => (
          <div
            onClick={handleCreateGame}
            key={game.id}
            className={`relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl p-4 sm:aspect-video ${game.bgColor}`}
          >
            <div className="px-6 sm:px-10">
              <Image
                unoptimized
                src={game.image}
                alt={game.title}
                fill
                className="object-contain object-bottom"
              />
            </div>

            <div className="relative z-10">
              <h3 className="font-nuni text-sm leading-tight font-extrabold text-white sm:text-base">
                {game.title}
              </h3>
              <p className="font-nuni text-xs text-white/80 sm:text-sm">
                {game.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
