import { FaHome } from "react-icons/fa";
import { Games, LivePlayers, RatingCompProps, SideBarProps } from "./types";
import { IoMdSettings } from "react-icons/io";

export const sidebarData: SideBarProps[] = [
  {
    label: "Home",
    href: "/home",
    icon: FaHome,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: IoMdSettings,
  },
];

export const ratingsData: RatingCompProps[] = [
  {
    label: "math",
    src: "/math.png",
    val: "896",
  },
  {
    label: "classical",
    src: "/classic.png",
    val: "1000",
  },
  {
    label: "puzzle",
    src: "/puzzle.png",
    val: "1000",
  },
  {
    label: "memory",
    src: "/memory.png",
    val: "1000",
  },
];

export const livePlayers: LivePlayers[] = [
  {
    id: "1",
    name: "You",
  },
];

export const games: Games[] = [
  {
    id: 1,
    title: "ONLINE DUELS",
    subtitle: "Quick-fire math duel",
    bgColor: "bg-blue-500",
    image: "/game-1.png",
  },
];
