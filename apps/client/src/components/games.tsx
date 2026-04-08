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
      <h1 className="w-full text-left font-extrabold font-bebas text-2xl text-neutral-100 tracking-widest mb-5 uppercase">
        ONLINE MULTIPLAYER GAMES
      </h1>

      <div
        className={`w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
          loading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {games.map((game) => (
          <div
            onClick={handleCreateGame}
            key={game.id}
            className={`w-full ${game.bgColor} rounded-xl p-4 aspect-video relative overflow-hidden cursor-pointer`}
          >
            <div className="px-10">
              <Image
                unoptimized
                src={game.image}
                alt={game.title}
                fill
                className="object-contain object-bottom"
              />
            </div>

            <div className="relative z-10">
              <h3 className="text-white font-extrabold text-sm font-nuni leading-tight">
                {game.title}
              </h3>
              <p className="text-white/80 text-sm font-nuni">{game.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
