"use client";

import { IoReload } from "react-icons/io5";
import { CardLayout } from "./cardlayout";

export const RightSideBar = () => {
  return (
    <div className="order-2 grid lg:pb-0 pb-20 gap-4 border-t border-neutral-800 px-4 py-4 xl:order-0 xl:w-80 xl:shrink-0 xl:auto-rows-max xl:border-t-0 xl:border-l xl:border-neutral-700 xl:overflow-y-auto xl:p-4">
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
