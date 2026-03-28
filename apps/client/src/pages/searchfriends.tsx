"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

type User = {
  id: number;
  name: string;
  avatar?: string;
};

const mockUsers: User[] = [
  { id: 1, name: "Abhinav R.12" },
  { id: 2, name: "Abhinav Verma" },
  { id: 3, name: "Abhinav Shukla" },
  { id: 4, name: "Abhinav Pandey" },
  { id: 5, name: "Abhinav Abhinav k" },
  { id: 6, name: "abhinav kumar abhinave" },
  { id: 7, name: "Abhinav Kumar Singh" },
];

export const SearchFriendsPage = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const filtered = mockUsers.filter((user) =>
      user.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
    );

    setResults(filtered);
  }, [debouncedQuery]);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="w-full h-full bg-neutral-900 flex justify-center items-start">
      <div className="w-full h-full max-w-2xl mx-auto px-4 py-4">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          {/* back button */}
          <button className="p-3 rounded-xl bg-neutral-800 border border-neutral-600 text-white">
            <FaArrowLeft />
          </button>

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
            <div
              key={user.id}
              className="flex items-center font-nuni gap-4 p-2 rounded-xl hover:bg-neutral-800 transition"
            >
              {/* avatar */}
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm">
                {getInitial(user.name)}
              </div>

              {/* name */}
              <p className="text-neutral-200 text-sm">{user.name}</p>
            </div>
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
