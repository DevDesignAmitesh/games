import Image from "next/image";

export const DownloadComp = () => {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-2">
      <Image
        unoptimized
        src={"/apple-store.png"}
        alt="google play"
        width={100}
        height={100}
        className="w-full"
      />
      <Image
        unoptimized
        src={"/google-play.png"}
        alt="google play"
        width={100}
        height={100}
        className="w-full"
      />
    </div>
  );
};
