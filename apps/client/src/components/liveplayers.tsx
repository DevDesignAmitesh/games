// TODO: Add view all players thing or hide the scroll bar

import { livePlayers } from "@/lib/data";

export const LivePlayers = () => {
  return (
    <div className="w-full py-3">
      <div className="custom-scrollbar overflow-x-auto h-full w-full">
        <div className="flex justify-start items-center gap-6 min-w-max">
          {livePlayers.map((player) => (
            <div
              key={player.id}
              className="flex flex-col justify-center items-center gap-1.5 relative shrink-0 cursor-pointer"
            >
              {/* Avatar */}
              <div className="p-1 rounded-full border-2 border-neutral-600 relative">
                <div className="h-12 w-12 rounded-full bg-purple-700 text-neutral-50 flex justify-center items-center shadow-lg">
                  <p className="text-xl font-semibold font-nuni">
                    {player.name[0]}
                  </p>
                </div>

                {/* Online Indicator (Top Right) */}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full"></div>
              </div>

              {/* Player Name */}
              <p className="text-neutral-400 text-[10px] font-nuni font-bold uppercase whitespace-nowrap">
                {player.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
