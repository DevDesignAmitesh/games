"use client";

import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useEffect, useState } from "react";
import Link from "next/link";
import { httpApis } from "@/managers/http";
import { useWsContext } from "@/managers/ws";

export const ProfilePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");

  
  const getData = async () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const data = await httpApis.getProfile(token!, username!);

    if (!data) return;

    setUserName(data.user.userName);
  };

  useEffect(() => {
    getData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.replace("/")
  };

  return (
    <div className="relative font-nuni">
      {/* Main Profile Button */}
      <div
        className={`flex justify-center items-center gap-3 cursor-pointer rounded-xl p-2 transition-all duration-200 ${
          isOpen
            ? "bg-neutral-700/50 backdrop-blur-sm"
            : "hover:bg-neutral-700/60 backdrop-blur-sm"
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="h-10 w-10 rounded-full bg-purple-600 flex justify-center items-center text-lg font-bold text-white">
          {userName?.[0] ?? "R"}
        </div>

        <div className="flex flex-col justify-center h-full">
          <p className="text-neutral-50 font-semibold font-nuni tracking-wide leading-tight text-sm">
            {userName}
          </p>
          <p className="text-neutral-100 font-bold text-sm">896</p>
        </div>

        <MdOutlineKeyboardArrowDown
          className={`text-neutral-300 text-xl transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full right-3 w-56 mt-1 bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-2xl z-50 transition-all duration-200 origin-top ${
          isOpen
            ? "opacity-100 block scale-100 translate-y-0"
            : "opacity-0 hidden scale-95 -translate-y-2 pointer-events-none"
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="py-2 font-nuni">
          {/* My Profile Option */}
          <Link
            href={`/profile/${userName}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-700/70 transition-all duration-150 mx-2 rounded-lg"
          >
            <FiUser className="text-neutral-300 text-lg" />
            <span className="text-white font-medium text-sm">My Profile</span>
          </Link>

          {/* Settings Option */}
          <Link
            href={"/settings"}
            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-700/70 transition-all duration-150 mx-2 rounded-lg"
          >
            <FiSettings className="text-neutral-300 text-lg" />
            <span className="text-white font-medium text-sm">Settings</span>
          </Link>

          {/* Logout Option */}
          <div
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 hover:bg-red-600/20 cursor-pointer transition-all duration-150 mx-2 rounded-lg group"
          >
            <FiLogOut className="text-neutral-300 text-lg group-hover:text-red-400 transition-colors duration-150" />
            <span className="text-white font-medium text-sm group-hover:text-red-400 transition-colors duration-150">
              Logout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
