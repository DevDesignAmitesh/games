"use client";

import { httpApis } from "@/managers/http";
import { useWsContext } from "@/managers/ws";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import { MdPersonAddAlt1 } from "react-icons/md";

type Game = {
  id: string;
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
  const [token, setToken] = useState<string | null>(null);

  const { ws } = useWsContext();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);

    const u = localStorage.getItem("username");
    if (u) setMyUsername(u);
  }, []);

  const getData = async (token: string, username: string) => {
    const data = await httpApis.getProfile(token, username);

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
  };

  useEffect(() => {
    if (!username) return;
    if (!token) return;
    getData(token, username);
  }, [username, token]);

  const sendToSettingPage = useCallback(() => {
    console.log("myusername ", myusername);
    console.log("username ", username);

    router.push("/settings");
  }, [myusername, router, username]);

  const sendFriendReq = async (
    token: string | null,
    username: string | null,
  ) => {
    if (!token) return;
    if (!username) return;
    if (myusername === username) return;
    if (status === "ACCEPTED" || status === "PENDING") return;

    const prevStatus = status;
    setStatus("PENDING");

    const res = await httpApis.sendFriendReq({ to: userId }, token, () =>
      getData(token, username),
    );

    if (!res) {
      setStatus(prevStatus);
      return;
    }

    ws?.send(
      JSON.stringify({
        type: "FRIEND_REQUEST_SEND",
        payload: { to: userId },
      }),
    );
  };

  return (
    <div className="h-full w-full px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="w-full h-fit rounded-xl bg-neutral-800 pb-4">
          <div className="relative h-32 w-full rounded-t-xl sm:h-40">
            <Image
              src="/profile-bg.png"
              alt="My Profile"
              fill
              unoptimized
              className="rounded-t-xl"
            />
            <p
              className="absolute top-1/2 left-1/2 text-3xl font-bebas font-bold tracking-wide sm:text-4xl
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

            <div className="absolute bottom-[-22%] left-4 z-20 flex h-16 w-16 items-center justify-center rounded-full border-4 border-neutral-800 bg-purple-700 font-nuni text-2xl font-semibold text-neutral-50 sm:left-5 sm:h-20 sm:w-20 sm:text-3xl">
              A
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col px-4 sm:mt-10">
            <h3 className="w-full text-left text-lg font-extrabold font-nuni text-neutral-50">
              {userName}
            </h3>
            <p className="w-full text-left text-sm font-nuni text-neutral-500">
              {email}
            </p>
            <Link
              href={"/friends"}
              className="text-left hover:underline text-sm font-medium mt-4 font-nuni text-[#A9F99E]"
            >
              <span className="font-bold">{friendCount}</span> Friends
            </Link>

            <div className="relative mt-8 inline-block w-full sm:w-fit">
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
                    myusername !== username
                      ? () => sendFriendReq(token, username)
                      : sendToSettingPage
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
          {Boolean(games.length) && (
            <h3 className="text-lg font-bold text-neutral-200 mb-4">
              Last 5 Games
            </h3>
          )}

          <div className="flex flex-col gap-4">
            {/* GAME ITEM */}
            {games.map((game, idx) => {
              const initial = game.name?.charAt(0).toUpperCase();

              return (
                <Link
                  href={`/game/${game.id}/result`}
                  key={idx}
                  className="flex flex-col gap-3 rounded-xl border border-neutral-700 bg-neutral-900/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
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
                  <div className="w-fit rounded-md border border-neutral-600 px-3 py-1 text-sm font-semibold text-neutral-200">
                    {game.oppCorrectAnswer} - {game.meCorrectAnswer}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
