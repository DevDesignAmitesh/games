import { games } from "@/lib/data";
import Image from "next/image";

export const Games = () => {
  return (
    <div className="mt-10">
      <h1 className="w-full text-left font-extrabold font-bebas text-2xl text-neutral-100 tracking-widest mb-5 uppercase">
        ONLINE MULTIPLAYER GAMES
      </h1>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            className={`w-full ${game.bgColor} rounded-xl p-4 aspect-video relative overflow-hidden cursor-pointer`}
          >
            {/* Game Image (if you have one) */}
            <div className="px-10">
              <Image
                unoptimized
                src={game.image}
                alt={game.title}
                width={40}
                height={40}
                className="w-full"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 mt-6">
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
