"use client";

import { httpApis } from "@/managers/http";
import { useWsContext } from "@/managers/ws";
import Link from "next/link";
import { useEffect, useState } from "react";

type FriendRequestStatus = "ACCEPTED" | "PENDING" | "IGNORED";

type Friend = {
  otherName: string;
  otherId: string;
  status: FriendRequestStatus;
  canAccept: boolean;
};

const getInitial = (name: string) => name.charAt(0).toUpperCase();

const FriendsPage = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { ws } = useWsContext();

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token")!;
      const data = await httpApis.getFriends(token);

      if (!data) return;

      setFriends(data);
    })();
  }, []);

  const handleFrndReq = async (id: string, status: FriendRequestStatus) => {
    const token = localStorage.getItem("token")!;

    setFriends((prev) =>
      prev.map((usr) => (usr.otherId === id ? { ...usr, status } : usr)),
    );

    const res = await httpApis.acceptFriendReq({ status, to: id }, token);

    if (!res) {
      setFriends((prev) =>
        prev.map((usr) =>
          usr.otherId === id ? { ...usr, status: "PENDING" } : usr,
        ),
      );
      return;
    }

    if (status === "ACCEPTED" && res) {
      ws?.send(
        JSON.stringify({
          type: "FRIEND_REQUEST_ACCEPT",
          payload: { to: id },
        }),
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-900 flex justify-center p-6">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        <h1 className="text-white text-xl font-semibold">Friends</h1>

        {friends.map((friend) => {
          return (
            <div
              key={friend.otherId}
              className="flex items-center justify-between bg-neutral-800 p-3 rounded-xl"
            >
              {/* Left side */}
              <Link
                href={`/profile/${friend.otherName}`}
                className="flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm">
                  {getInitial(friend.otherName)}
                </div>

                {/* Name + Status */}
                <div className="flex flex-col">
                  <p className="text-neutral-200 text-sm">{friend.otherName}</p>
                  <p className="text-xs text-neutral-400">{friend.status}</p>
                </div>
              </Link>

              {/* Right side actions */}

              <div className="flex items-center gap-2">
                {friend.status === "PENDING" && friend.canAccept && (
                  <>
                    <button
                      onClick={() => handleFrndReq(friend.otherId, "ACCEPTED")}
                      className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleFrndReq(friend.otherId, "IGNORED")}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md"
                    >
                      Ignore
                    </button>
                  </>
                )}

                {friend.status === "ACCEPTED" && (
                  <span className="text-green-400 text-xs">Friends</span>
                )}

                {friend.status === "IGNORED" && (
                  <span className="text-red-400 text-xs">Ignored</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendsPage;
