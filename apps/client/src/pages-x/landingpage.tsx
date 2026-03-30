"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { PopupScreen } from "@/components/popupScreen";
import { Showcase } from "@/components/showcase";
import { TotalUsers } from "@/components/totalusers";
import { popupType } from "@/lib/types";
import { useState } from "react";

const LandingPage = () => {
  const [popup, setPopup] = useState<popupType | null>(null);

  const handlePopup = (val: popupType | null) => {
    setPopup(val);
  };

  return (
    <>
      <div className="w-full min-h-screen bg-neutral-900">
        <Header onClick={() => handlePopup("play")} />
        <Hero onClick={() => handlePopup("download")} />

        <Showcase
          direction="row"
          img="/trophy.webp"
          title="Thinking is a sport"
          content="You face real opponents, react in real time, and get better every time you play."
        />
        <Showcase
          direction="reverse"
          img="/fire.webp"
          title="streaks reflect momentum"
          content="They track consistency in play - not reminders to come back."
        />
        <Showcase
          direction="row"
          img="/key.webp"
          title="features That show progress"
          content="You face real opponents, react in real time, and get better every time you play."
        />
        <Showcase
          direction="reverse"
          img="/box.webp"
          title="Game Modes that define your play-style"
          content="Each mode targets a different skill set- Math, Memory, Puzzle and Classical."
        />

        <TotalUsers />

        <Footer onClick={(val) => handlePopup(val)} />
      </div>

      {popup && (
        <PopupScreen
          type={popup}
          onClick={() => handlePopup(null)}
          handleAuthState={(val) => handlePopup(val)}
        />
      )}
    </>
  );
};

export default LandingPage