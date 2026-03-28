"use client";

import { Logo } from "./logo";
import { ProfilePopup } from "./profilepopup";

export const HomeHeader = () => {
  if (typeof window === "undefined") return;

  return (
    <header className="w-full py-2 px-4 flex justify-between items-center shrink-0 border-b border-neutral-700">
      <Logo type="header" />
      <ProfilePopup />
    </header>
  );
};
