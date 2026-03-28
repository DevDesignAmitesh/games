import {
  FaHome,
  FaMedal,
  FaUser,
  FaCommentDots,
  FaShareAlt,
} from "react-icons/fa";
import { Games, LivePlayers, RatingCompProps, SideBarProps } from "./types";
import { IoMdSettings } from "react-icons/io";

// TODO: get here token driven user-name
const userName = "amiteshsingh";

export const sidebarData: Array<SideBarProps> = [
  {
    label: "Home",
    href: "/home",
    icon: FaHome,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: FaMedal,
  },
  {
    label: "My Profile",
    href: `/profile/${userName}`,
    icon: FaUser,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: IoMdSettings,
  },
  {
    label: "Feedback",
    href: "/feedback",
    icon: FaCommentDots,
  },
  {
    label: "Social",
    href: "/social",
    icon: FaShareAlt,
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

export const livePlayers: Array<LivePlayers> = [
  {
    id: "1",
    name: "You",
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
