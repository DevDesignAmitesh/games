"use client";

import { GrayButton } from "@/components/buttons";
import { Logo } from "@/components/logo";
import { httpApis } from "@/managers/http";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const OnlineSearchPage = ({ gameId }: { gameId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cancelSearch = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const res = await httpApis.deleteGame(gameId, token);

    if (!res) {
      setLoading(false);
      return;
    }

    toast.info("Users not found, game cancelled");
    router.back();
  }, [gameId, loading, router]);

  useEffect(() => {
    const timeout = setTimeout(cancelSearch, 30 * 1000);

    return () => clearTimeout(timeout);
  }, [cancelSearch]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-neutral-900 px-4 py-10 sm:gap-16">
      {/* TEXT */}
      <p className="mb-4 text-center font-nuni text-sm tracking-widest text-neutral-400 sm:mb-6">
        SEARCHING FOR OPPONENT
      </p>
      {/* RADAR */}
      <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
        {/* grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-size-[2rem_2rem]" />

        {/* circles */}
        <div className="absolute h-32 w-32 rounded-full border border-white/20 sm:h-40 sm:w-40" />
        <div className="absolute h-48 w-48 rounded-full border border-white/10 sm:h-56 sm:w-56" />
        <div className="absolute h-60 w-60 rounded-full border border-white/5 sm:h-72 sm:w-72" />

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
      <GrayButton
        onClick={cancelSearch}
        label={loading ? "Cancelling..." : "Cancel search"}
      />
    </div>
  );
};

export default OnlineSearchPage;
