"use client";

import { httpApis } from "@/managers/http";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

type User = {
  id: number;
  userName: string;
};

const SearchFriendsPage = () => {
  if (typeof window === "undefined") return;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);

  const router = useRouter();

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  useEffect(() => {
    const token = localStorage.getItem("token")!;

    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    (async () => {
      const data = await httpApis.findFriends(token, debouncedQuery);

      console.log("data ", data);

      if (!data) return;

      setResults(data);
    })();
  }, [debouncedQuery]);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="w-full h-full bg-neutral-900 flex justify-center items-start">
      <div className="w-full h-full max-w-2xl mx-auto px-4 py-4">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
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

          {/* search bar */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full border border-green-500 bg-neutral-800">
            <FaSearch className="text-neutral-400" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search friends..."
              className="flex-1 bg-transparent outline-none text-white text-sm"
            />

            {query && (
              <button onClick={() => setQuery("")}>
                <IoClose className="text-white text-lg" />
              </button>
            )}
          </div>
        </div>

        {/* RESULTS */}
        <div className="flex flex-col gap-4">
          {results.map((user) => (
            <Link
              href={`/profile/${user.userName}`}
              key={user.id}
              className="flex items-center font-nuni gap-4 p-2 rounded-xl hover:bg-neutral-800 transition"
            >
              {/* avatar */}
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm">
                {getInitial(user.userName)}
              </div>

              {/* name */}
              <p className="text-neutral-200 text-sm">{user.userName}</p>
            </Link>
          ))}

          {/* empty state */}
          {debouncedQuery && results.length === 0 && (
            <p className="text-neutral-500 text-sm text-center mt-10">
              No users found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFriendsPage;
