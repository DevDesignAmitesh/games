"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineChevronRight } from "react-icons/md";

const SettingsPage = () => {
  const router = useRouter();
  
  return (
    <div className="h-full w-full px-4 py-4 sm:px-6">
      <div className="mx-auto h-full w-full max-w-2xl">
        <header className="flex w-full items-center gap-4 py-4 sm:py-6">
          {/* button */}
          <div
            onClick={() => router.back()}
            className="relative inline-block w-auto"
          >
            <button
              className="relative z-10 w-full
                flex items-center justify-between gap-3
                p-3
                rounded-xl cursor-pointer
                bg-neutral-900 border border-neutral-500
                text-neutral-50 font-bold font-nuni
                text-xs
                transition-all active:translate-y-0.5"
            >
              {/* Left Icon */}
              <span className="flex items-center">
                <FaArrowLeft />
              </span>
            </button>

            {/* Band */}
            <div
              className="absolute left-0 right-0
                -bottom-1
                h-4 sm:h-5
                bg-neutral-500
                rounded-full"
            />
          </div>

          <h3 className="text-lg font-nuni font-medium text-neutral-50">
            Settings
          </h3>
        </header>

        <div className="mt-4 grid w-full font-nuni">
          <div
            className="w-full cursor-pointer rounded-md border border-neutral-700 py-5 sm:py-6"
          >
            <div 
              onClick={() => router.push("/search-mathletes")}
              className="flex w-full items-center justify-between gap-4 px-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-neutral-50 font-semibold">
                  Search friends by username
                </p>
              </div>
              <MdOutlineChevronRight className="text-neutral-50 text-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage
