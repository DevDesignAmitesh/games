"use client";

import { sidebarData } from "@/lib/data";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const LeftSideBar = () => {
  const pathName = usePathname();

  return (
    <div className="lg:relative fixed bottom-0 w-full order-3 border-t border-neutral-700 bg-neutral-900 px-3 py-3 lg:order-none lg:w-44 lg:shrink-0 lg:border-t-0 lg:border-r lg:p-4">
      <div className="flex justify-between lg:justify-start gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
      {sidebarData.map((item) => {
        const IconComponent = item.icon;

        return (
          <Link
            href={item.href}
            key={item.href}
            className={`flex shrink-0 items-center gap-2 rounded-lg transition-colors duration-200 lg:w-full ${
              pathName === item.href
                ? "border border-[#A9F99E] px-3 py-2.5 text-[#A9F99E] lg:px-4 lg:py-3.5"
                : "p-3 text-neutral-300 lg:p-4"
            }`}
          >
            <IconComponent />
            <p
              className={`whitespace-nowrap text-xs capitalize font-nuni tracking-wide ${
                pathName === item.href ? "text-[#A9F99E]" : "text-neutral-400"
              }`}
            >
              {item.label}
            </p>
          </Link>
        );
      })}
      </div>
    </div>
  );
};
