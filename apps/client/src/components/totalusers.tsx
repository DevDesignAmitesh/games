export const TotalUsers = () => {
  const digits = [9, 0, 4, 0, 8, 2];

  return (
    <section className="w-full py-20 md:py-32 bg-neutral-950 flex flex-col items-center gap-12 px-6">
      {/* Heading */}
      <h2
        className="text-[#B1FA63] 
        text-5xl sm:text-7xl md:text-[100px] lg:text-[120px]
        leading-[0.9] tracking-tight 
        font-bebas opacity-30 text-center"
      >
        TOTAL USERS
      </h2>

      {/* Digits */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {digits.map((val, index) => (
          <div
            key={index}
            className="bg-[#3A3A3A] 
              text-[#B1FA63]
              text-4xl sm:text-6xl md:text-7xl lg:text-[90px]
              leading-[0.8]
              font-bold tracking-tight font-bebas
              px-5 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6
              rounded-xl md:rounded-2xl"
          >
            {/* {val} */}
            0
          </div>
        ))}
      </div>
    </section>
  );
};
