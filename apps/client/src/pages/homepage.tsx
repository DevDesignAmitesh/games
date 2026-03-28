import { Games } from "@/components/games";
import { LivePlayers } from "@/components/liveplayers";

export const HomePage = () => {
  return (
    <div className="px-8 py-4 h-full">
      <LivePlayers />
      <Games />
    </div>
  );
};
