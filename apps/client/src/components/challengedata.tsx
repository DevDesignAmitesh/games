import { IoMdArrowDropright } from "react-icons/io";

export const ChallengComp = () => {
  return (
    <div className="grid h-full w-full gap-2">
      <div className="flex w-full items-center justify-between rounded-xl bg-neutral-800 px-3 py-4">
        <p className="font-bebas text-3xl tracking-wide text-[#A6A5F2] uppercase sm:text-4xl">
          puzzle
        </p>
        <IoMdArrowDropright className="text-neutral-100 text-xl" />
      </div>
      <div className="flex w-full items-center justify-between rounded-xl bg-neutral-800 px-3 py-4">
        <p className="font-bebas text-3xl tracking-wide text-[#FF932E] uppercase sm:text-4xl">
          math
        </p>
        <IoMdArrowDropright className="text-neutral-100 text-xl" />
      </div>
    </div>
  );
};
