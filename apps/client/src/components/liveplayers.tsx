"use client";

import { useWsContext } from "@/managers/ws";

export const LivePlayers = () => {
  const { liveUsers } = useWsContext();

  return (
    <div className="w-full py-3">
      <div className="custom-scrollbar-x h-full w-full overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex min-w-max items-center justify-start gap-4 sm:gap-6">
          {liveUsers.map((player) => (
            <div
              key={player.id}
              className="relative flex shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5"
            >
              {/* Avatar */}
              <div className="p-1 rounded-full border-2 border-neutral-600 relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700 text-neutral-50 shadow-lg sm:h-12 sm:w-12">
                  <p className="font-nuni text-lg font-semibold sm:text-xl">
                    {player.username[0]}
                  </p>
                </div>

                {/* Online Indicator (Top Right) */}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full"></div>
              </div>

              {/* Player Name */}
              <p className="font-nuni text-[10px] font-bold whitespace-nowrap uppercase text-neutral-400 sm:text-xs">
                {player.username}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
