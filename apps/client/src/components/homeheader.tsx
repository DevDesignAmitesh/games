"use client";

import { Logo } from "./logo";
import { ProfilePopup } from "./profilepopup";

export const HomeHeader = () => {
  return (
    <header className="sticky top-0 z-30 flex w-full shrink-0 items-center justify-between border-b border-neutral-700 bg-neutral-900/95 px-4 py-3 backdrop-blur md:px-6">
      <Logo type="header" />
      <ProfilePopup />
    </header>
  );
};
