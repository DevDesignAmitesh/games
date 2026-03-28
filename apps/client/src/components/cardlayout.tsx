import { CardLayoutProps } from "@/lib/types";
import { RatingComp } from "./ratingcomp";
import { ratingsData } from "@/lib/data";
import { ChallengComp } from "./challengedata";
import { DownloadComp } from "./download";

export const CardLayout = ({ label, icon, type }: CardLayoutProps) => {
  return (
    <div
      className={`w-full h-fit rounded-xl p-4 flex flex-col border border-neutral-700
    ${type === "download" && "xl:flex hidden"}
    `}
    >
      <div className="w-full flex justify-between items-center pb-4">
        <p className="text-xs tracking-wider text-neutral-500 font-bold font-nuni uppercase">
          {label}
        </p>
        {icon}
      </div>

      {type === "rating" && (
        <div className="w-full h-full grid grid-cols-2 gap-2">
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
