import { Games } from "@/components/games";
import { LivePlayers } from "@/components/liveplayers";

const HomePage = () => {
  return (
    <div className="px-8 py-4 h-full">
      <LivePlayers />
      <Games />
    </div>
  );
};

export default HomePage;
