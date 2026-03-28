import Image from "next/image";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import { MdPersonAddAlt1 } from "react-icons/md";

export const ProfilePage = () => {
  return (
    <div className="w-full h-full px-20 py-4">
        <div className="w-full h-full rounded-xl bg-neutral-800 pb-4">
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
              Amitesh Singh
            </h3>
            <p className="w-full text-left text-sm font-nuni text-neutral-500">
              @amiteshsingh
            </p>
            <p className="w-full text-left text-sm font-medium mt-4 font-nuni text-[#A9F99E]">
              <span className="font-bold">1</span> Friends
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
                <span className="flex-1 text-center font-bold text-[#A9F99E]">ADD MORE FRIENDS</span>
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
      {/* <div className="w-full max-w-6xl mx-auto h-auto p-4 grid gap-10 grid-cols-6">
        <div className="w-full h-full col-span-2 bg-red-300"></div>
      </div> */}
    </div>
  );
};
