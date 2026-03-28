import Image from "next/image";

interface ShowcaseProps {
  direction: "row" | "reverse";
  img: string;
  title: string;
  content: string;
}

export const Showcase = ({ content, direction, img, title }: ShowcaseProps) => {
  return (
    <section className="w-full py-12 md:py-20 px-6">
      <div
        className={`max-w-6xl mx-auto flex flex-col items-center gap-12 md:gap-20 ${
          direction === "row" ? "md:flex-row" : "md:flex-row-reverse"
        }`}
      >
        {/* Image */}
        <div className="flex-1 flex justify-center">
          <Image
            src={img}
            alt="Showcase Image"
            width={600}
            height={600}
            className="w-72 sm:w-80 md:w-96 lg:w-105 h-auto object-contain"
          />
        </div>

        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="font-bebas font-extrabold text-white leading-tight">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              {title}
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-neutral-400 max-w-md mx-auto md:mx-0 font-nuni">
            {content}
          </p>
        </div>
      </div>
    </section>
  );
};
