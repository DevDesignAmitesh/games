"use client";

import { Games } from "@/components/games";
import { LivePlayers } from "@/components/liveplayers";

const HomePage = () => {
  return (
    <div className="h-full px-4 py-4 sm:px-6 lg:px-8">
      <LivePlayers />
      <Games />
    </div>
  );
};

export default HomePage;
