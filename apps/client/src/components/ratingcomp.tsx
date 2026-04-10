import { RatingCompProps } from "@/lib/types";
import Image from "next/image";

export const RatingComp = ({ label, src, val }: RatingCompProps) => {
  return (
    <div className="flex h-full items-center justify-center gap-3 rounded-xl bg-neutral-800 px-3 py-3">
      <Image
        unoptimized
        src={src}
        alt="math"
        height={100}
        width={100}
        className="w-7 sm:w-8"
      />
      <div className="flex flex-col items-center justify-center">
        <p className="font-nuni text-[10px] font-bold tracking-wider text-neutral-300 uppercase">
          {label}
        </p>
        <p className="font-nuni text-lg font-black text-neutral-50 uppercase sm:text-xl">
          {val}
        </p>
      </div>
    </div>
  );
};
