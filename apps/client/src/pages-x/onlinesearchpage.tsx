"use client";

import { GrayButton } from "@/components/buttons";
import { Logo } from "@/components/logo";
import { httpApis } from "@/managers/http";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const OnlineSearchPage = ({ gameId }: { gameId: string }) => {
  const router = useRouter();

  const cancelSearch = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await httpApis.deleteGame(gameId, token);
    if (!res) return;

    router.back();
    toast.info("Users not found, game cancelled");
  };

  useEffect(() => {
    const timeout = setTimeout(cancelSearch, 30 * 1000);

    return () => clearTimeout(timeout);
  });

  return (
    <div className="w-full h-screen bg-neutral-900 flex flex-col gap-20 justify-center items-center">
      {/* TEXT */}
      <p className="text-neutral-400 font-nuni tracking-widest text-sm mb-10">
        SEARCHING FOR OPPONENT
      </p>

      {/* RADAR */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-size-[2rem_2rem]" />

        {/* circles */}
        <div className="absolute w-40 h-40 rounded-full border border-white/20" />
        <div className="absolute w-56 h-56 rounded-full border border-white/10" />
        <div className="absolute w-72 h-72 rounded-full border border-white/5" />

        {/* sweeping radar line */}
        <div className="absolute w-full h-full animate-spin-slow">
          <div className="absolute left-1/2 top-1/2 w-0.5 h-1/2 bg-linear-to-t from-white/80 to-transparent origin-bottom" />
        </div>

        {/* moving dot */}
        <div className="absolute w-full h-full animate-spin-slow">
          <div className="absolute left-1/2 top-4 w-3 h-3 bg-green-400 rounded-full -translate-x-1/2 shadow-[0_0_10px_#4ade80]" />
        </div>

        {/* center logo */}
        <Logo type="header" />
      </div>

      <GrayButton onClick={cancelSearch} label="Cancel search" />
    </div>
  );
};

export default OnlineSearchPage;
