"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineChevronRight } from "react-icons/md";

const SettingsPage = () => {
  const router = useRouter();
  
  return (
    <div className="w-full h-full">
      <div className="w-full h-full max-w-2xl mx-auto">
        <header className="w-full flex gap-4 items-center py-6">
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

        <div className="w-full grid font-nuni mt-4">
          <div
            className="w-full border rounded-md border-neutral-700 py-6 cursor-pointer"
          >
            <div 
              onClick={() => router.push("/search-mathletes")}
              className="w-full flex justify-between items-center px-4">
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
