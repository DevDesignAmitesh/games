import { RatingCompProps } from "@/lib/types";
import Image from "next/image";

export const RatingComp = ({ label, src, val }: RatingCompProps) => {
  return (
    <div className="bg-neutral-800 flex h-full justify-center items-center gap-4 rounded-xl py-3">
      <Image
        unoptimized
        src={src}
        alt="math"
        height={100}
        width={100}
        className="w-8"
      />
      <div className="flex flex-col justify-center items-center">
        <p className="text-[10px] tracking-wider text-neutral-300 font-bold font-nuni uppercase">
          {label}
        </p>
        <p className="text-xl text-neutral-50 font-black font-nuni uppercase">
          {val}
        </p>
      </div>
    </div>
  );
};
