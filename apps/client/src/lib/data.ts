import { FaHome, FaUser } from "react-icons/fa";
import { Games, LivePlayers, RatingCompProps, SideBarProps } from "./types";
import { IoMdSettings } from "react-icons/io";

export const sidebarData: Array<SideBarProps> = [
  {
    label: "Home",
    href: "/home",
    icon: FaHome,
  },
  {
    label: "Friends",
    href: "/friends",
    icon: FaUser,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: IoMdSettings,
  },
];

export const ratingsData: Array<RatingCompProps> = [
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

export const games: Array<Games> = [
  {
    id: 1,
    title: "ONLINE DUELS",
    subtitle: "Quick-fire math duel",
    bgColor: "bg-blue-500",
    image: "/game-1.png",
  },
];
