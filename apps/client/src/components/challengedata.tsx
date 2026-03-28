import { IoMdArrowDropright } from "react-icons/io";

export const ChallengComp = () => {
  return (
    <div className="w-full h-full grid gap-2">
      <div className="w-full bg-neutral-800 flex justify-between items-center px-3 py-4 rounded-xl">
        <p className="text-[#A6A5F2] text-4xl font-bebas tracking-wide uppercase">
          puzzle
        </p>
        <IoMdArrowDropright className="text-neutral-100 text-xl" />
      </div>
      <div className="w-full bg-neutral-800 flex justify-between items-center px-3 py-4 rounded-xl">
        <p className="text-[#FF932E] text-4xl font-bebas tracking-wide uppercase">
          math
        </p>
        <IoMdArrowDropright className="text-neutral-100 text-xl" />
      </div>
    </div>
  );
};
