import Image from "next/image";

export const DownloadComp = () => {
  return (
    <div className="grid h-full w-full grid-cols-2 gap-2 xl:grid-cols-1 2xl:grid-cols-2">
      <Image
        unoptimized
        src={"/apple-store.png"}
        alt="google play"
        width={100}
        height={100}
        className="h-auto w-full object-contain"
      />
      <Image
        unoptimized
        src={"/google-play.png"}
        alt="google play"
        width={100}
        height={100}
        className="h-auto w-full object-contain"
      />
    </div>
  );
};
