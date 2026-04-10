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
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const { ws } = useWsContext();

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token")!;
      const data = await httpApis.getFriends(token);

      if (data) setFriends(data);

      setPageLoading(false);
    })();
  }, []);

  const handleFrndReq = async (id: string, status: FriendRequestStatus) => {
    const token = localStorage.getItem("token")!;

    setActionLoadingId(id);

    // optimistic update
    setFriends((prev) =>
      prev.map((usr) => (usr.otherId === id ? { ...usr, status } : usr)),
    );

    const res = await httpApis.acceptFriendReq({ status, to: id }, token);

    if (!res) {
      // rollback
      setFriends((prev) =>
        prev.map((usr) =>
          usr.otherId === id ? { ...usr, status: "PENDING" } : usr,
        ),
      );
      setActionLoadingId(null);
      return;
    }

    if (status === "ACCEPTED") {
      ws?.send(
        JSON.stringify({
          type: "FRIEND_REQUEST_ACCEPT",
          payload: { to: id },
        }),
      );
    }

    setActionLoadingId(null);
  };

  return (
    <div className="flex h-full w-full justify-center bg-neutral-900 px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <h1 className="text-white text-xl font-semibold">Friends</h1>

        {/* Page Loader */}
        {pageLoading && (
          <div className="flex justify-center items-center py-10">
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!pageLoading && friends.length === 0 && (
          <p className="text-neutral-400 text-sm w-full text-center mt-4">No friends yet</p>
        )}

        {!pageLoading &&
          friends.map((friend) => {
            const isLoading = actionLoadingId === friend.otherId;

            return (
              <div
                key={friend.otherId}
                className="flex flex-col gap-3 rounded-xl bg-neutral-800 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Left side */}
                <Link
                  href={`/profile/${friend.otherName}`}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm">
                    {getInitial(friend.otherName)}
                  </div>

                  <div className="flex flex-col">
                    <p className="text-neutral-200 text-sm">
                      {friend.otherName}
                    </p>
                    <p className="text-xs text-neutral-400">{friend.status}</p>
                  </div>
                </Link>

                {/* Right side */}
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {friend.status === "PENDING" && friend.canAccept && (
                    <>
                      <button
                        disabled={isLoading}
                        onClick={() =>
                          handleFrndReq(friend.otherId, "ACCEPTED")
                        }
                        className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
                      >
                        {isLoading ? "..." : "Accept"}
                      </button>

                      <button
                        disabled={isLoading}
                        onClick={() => handleFrndReq(friend.otherId, "IGNORED")}
                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
                      >
                        {isLoading ? "..." : "Ignore"}
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
