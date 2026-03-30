"use client";

import { useState } from "react";
import Sound from "react-sound";

const SurprisePage = () => {
  const [playStatus, setPlayStatus] = useState<"STOPPED" | "PLAYING">(
    "STOPPED",
  );

  const handleClick = () => {
    setPlayStatus("STOPPED");
    setTimeout(() => setPlayStatus("PLAYING"), 10);
  };

  return (
    <div className="w-full h-screen bg-neutral-900 flex justify-center items-center">
      <Sound
        url="/fah.mp3"
        playStatus={playStatus}
        onFinishedPlaying={() => setPlayStatus("STOPPED")}
      />

      <div className="relative inline-block">
        <button
          onClick={handleClick}
          className="relative z-10
          w-40 h-40 sm:w-48 sm:h-48
          rounded-full
          flex items-center justify-center
          bg-neutral-900 border-2 border-[#B1FA63]
          text-[#B1FA63] font-bold font-nuni
          text-sm sm:text-base text-center
          transition-all duration-75
          active:translate-y-2 active:scale-95"
        >
          PRESS ME
        </button>
      </div>
    </div>
  );
};

export default SurprisePage
