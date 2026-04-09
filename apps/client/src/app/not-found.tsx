"use client";

import { GreenButton } from "@/components/buttons";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-full h-screen bg-neutral-900 flex flex-col justify-center items-center text-neutral-50">
      <Image
        src={"/not-found.png"}
        height={100}
        width={100}
        alt="not-found"
        loading="lazy"
        className="w-sm"
        unoptimized
      />

      <h2 className="mt-4 text-red-400 text-2xl font-extrabold font-nuni">
        404 - Page Not Found
      </h2>
      <p className="max-w-lg mt-2 text-sm mb-6 font-medium font-nuni text-neutral-400 text-center">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>

      <GreenButton label="Return Home" onClick={() => router.push("/")} />
    </div>
  );
}
