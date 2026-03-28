import { ReactElement } from "react";
import { IconType } from "react-icons";

export type popupType =
  | "play"
  | "download"
  | "login"
  | "signup"
  | "login-action"
  | "verify-otp"
  | "signup-action";

export type CardLayoutProps = {
  label: string;
  icon?: ReactElement;
  type: "rating" | "challenge" | "download";
};

export type SideBarProps = {
  label: string;
  href: string;
  icon: IconType;
};

export type RatingCompProps = {
  src: string;
  label: string;
  val: string;
};

export type LivePlayers = {
  id: string;
  name: string;
};

export type Games = {
  id: number;
  title: string;
  subtitle: string;
  bgColor: string;
  image: string;
};
