export const LoadingScreen = () => {
  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-col gap-4 justify-center items-center">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-[#B1FA63]/30 border-t-[#B1FA63] rounded-full animate-spin" />

      <p className="font-nuni text-lg text-[#B1FA63] tracking-wider">
        Initializing
      </p>
    </div>
  );
};
