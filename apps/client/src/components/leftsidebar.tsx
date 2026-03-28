"use client";

import { sidebarData } from "@/lib/data";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const LeftSideBar = () => {
  const pathName = usePathname();

  return (
    <div className="w-44 shrink-0 border-r border-neutral-700 p-4 gap-1 flex flex-col">
      {sidebarData.map((item) => {
        const IconComponent = item.icon;

        return (
          <Link
            href={item.href}
            key={item.href}
            className={`w-full rounded-lg flex items-center gap-2 cursor-pointer transition-colors duration-200 ${
              pathName === item.href
                ? "border border-[#A9F99E] text-[#A9F99E] px-4 py-3.5"
                : "text-neutral-300 p-4"
            }`}
          >
            <IconComponent />
            <p
              className={`text-xs capitalize font-nuni tracking-wide ${
                pathName === item.href ? "text-[#A9F99E]" : "text-neutral-400"
              }`}
            >
              {item.label}
            </p>
          </Link>
        );
      })}
    </div>
  );
};
