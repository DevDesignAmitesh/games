"use client";

import { httpApis } from "@/managers/http";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import { MdPersonAddAlt1 } from "react-icons/md";

type Game = {
  name: string | undefined;
  oppCorrectAnswer: number | undefined;
  meCorrectAnswer: number | undefined;
};

const ProfilePage = ({ username }: { username: string | null }) => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [friendCount, setFriendCount] = useState<number>(0);
  const [games, setGames] = useState<Game[]>([]);
  const [myusername, setMyUsername] = useState<string>("");
  const [status, setStatus] = useState<
    "PENDING" | "ACCEPTED" | "IGNORED" | undefined
  >(undefined);

  useEffect(() => {
    setMyUsername(localStorage.getItem("username") ?? "");
  }, []);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(`Bearer ${t}`);
  }, []);

  const getData = useCallback(async () => {
    if (!username) return;
    if (!token) return;
    const data = await httpApis.getProfile(token, username);

    console.log("profile data ", data);

    if (!data) {
      router.push("/404");
      return;
    }

    setUserName(data.user.userName);
    setUserId(data.user.id);
    setEmail(data.user.email);
    setFriendCount(data.user.count);
    setStatus(data.status);
    setGames(data.games);
  }, [username, token]);

  useEffect(() => {
    getData();
  }, [getData]);

  const sendToSettingPage = () => {
    router.push("/settings");
  };

  const sendFriendReq = async () => {
    console.log(status);
    if (!token) return;
    if (myusername === username) return;
    if (status === "ACCEPTED" || status === "PENDING") return;

    const prevStatus = status;
    setStatus("PENDING"); // better than ACCEPTED

    const res = await httpApis.sendFriendReq({ to: userId }, token, getData);

    if (!res) setStatus(prevStatus);
  };

  return (
    <div className="w-full h-full px-20 py-4">
      <div className="w-full h-fit rounded-xl bg-neutral-800 pb-4">
        <div className="w-full h-40 relative rounded-t-xl">
          <Image
            src="/profile-bg.png"
            alt="My Profile"
            fill
            unoptimized
            className="rounded-t-xl"
          />
          <p
            className="text-4xl font-bebas font-bold tracking-wide absolute top-1/2 left-1/2 
              -translate-x-1/2 -translate-y-1/2"
          >
            ROOKIE
          </p>

          <div className="w-full flex justify-between items-center p-2 absolute">
            {/* buttons */}
            <div
              // onClick={() => router.back()}
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

            <div
              // onClick={() => router.back()}
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
                  <BsThreeDotsVertical />
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
          </div>

          <div className="absolute left-5 bottom-[-25%] z-20 h-20 w-20 rounded-full bg-purple-700 text-neutral-50 border-6 border-neutral-800 font-nuni text-3xl font-semibold flex justify-center items-center">
            A
          </div>
        </div>

        <div className="flex flex-col w-full px-4 mt-10">
          <h3 className="w-full text-left text-lg font-extrabold font-nuni text-neutral-50">
            {userName}
          </h3>
          <p className="w-full text-left text-sm font-nuni text-neutral-500">
            {email}
          </p>
          <p className="w-full text-left text-sm font-medium mt-4 font-nuni text-[#A9F99E]">
            <span className="font-bold">{friendCount}</span> Friends
          </p>

          <div className="relative inline-block w-fit mt-8">
            <button
              className="relative z-10 w-full
                  flex items-center justify-between gap-3
                  px-5 py-2
                  rounded-xl cursor-pointer
                  bg-neutral-900 border border-neutral-500
                  text-neutral-50 font-bold font-nuni
                  text-xs
                  transition-all active:translate-y-0.5"
            >
              {/* Left Icon */}
              <span className="flex items-center text-[#A9F99E]">
                <MdPersonAddAlt1 size={20} />
              </span>

              {/* Label */}
              <span
                onClick={
                  myusername !== username ? sendFriendReq : sendToSettingPage
                }
                className="flex-1 text-center font-bold text-[#A9F99E]"
              >
                {status && status === "ACCEPTED"
                  ? "ALREADY FRIENDS"
                  : status === "IGNORED" ||
                      status === "PENDING" ||
                      myusername !== username
                    ? "SEND FRIEND REQUEST"
                    : "ADD MORE FRIENDS"}
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
        </div>
      </div>
      {/* LAST 5 GAMES */}
      <div className="mt-10 pb-6">
        {games.length && (
          <h3 className="text-lg font-bold text-neutral-200 mb-4">
            Last 5 Games
          </h3>
        )}

        <div className="flex flex-col gap-4">
          {/* GAME ITEM */}
          {games.map((game, idx) => {
            const initial = game.name?.charAt(0).toUpperCase();

            return (
              <div
                key={idx}
                className="flex items-center justify-between bg-neutral-900/60 px-4 py-3 rounded-xl border border-neutral-700"
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-semibold">
                    {initial}
                  </div>

                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-neutral-200">
                      {game.name}
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="px-3 py-1 rounded-md border border-neutral-600 text-sm font-semibold text-neutral-200">
                  {game.oppCorrectAnswer} - {game.meCorrectAnswer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage