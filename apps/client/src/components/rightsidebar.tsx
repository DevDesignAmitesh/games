"use client";

import { IoReload } from "react-icons/io5";
import { CardLayout } from "./cardlayout";
import { usePathname } from "next/navigation";

export const RightSideBar = () => {
  const pathName = usePathname();

  // if (pathName !== "/home") return null;

  return (
    <div className="w-80 shrink-0 overflow-auto grid p-4 gap-4 place-content-start">
      <CardLayout
        label="RATINGS"
        icon={<IoReload className="text-neutral-300" />}
        type="rating"
      />
      <CardLayout label="DAILY CHALLENGES" type="challenge" />
      <CardLayout label="DOWNLOAD MOBILE APP" type="download" />
    </div>
  );
};
