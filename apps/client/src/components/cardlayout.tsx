import { CardLayoutProps } from "@/lib/types";
import { RatingComp } from "./ratingcomp";
import { ratingsData } from "@/lib/data";
import { ChallengComp } from "./challengedata";
import { DownloadComp } from "./download";

export const CardLayout = ({ label, icon, type }: CardLayoutProps) => {
  return (
    <div
      className={`flex h-fit w-full flex-col rounded-xl border border-neutral-700 p-4
    ${type === "download" ? "col-span-1" : ""}
    `}
    >
      <div className="flex w-full items-center justify-between pb-4">
        <p className="font-nuni text-xs font-bold tracking-wider text-neutral-500 uppercase">
          {label}
        </p>
        {icon}
      </div>

      {type === "rating" && (
        <div className="grid h-full w-full grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2">
          {ratingsData.map((item) => (
            <RatingComp {...item} key={item.src} />
          ))}
        </div>
      )}

      {type === "challenge" && <ChallengComp />}

      {type === "download" && <DownloadComp />}
    </div>
  );
};
