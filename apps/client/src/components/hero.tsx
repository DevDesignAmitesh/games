import Image from "next/image";
import { GreenButton } from "./buttons";

interface HeroProps {
  onClick: () => void;
}

export const Hero = ({ onClick }: HeroProps) => {
  return (
    <section className="relative w-full h-auto flex items-center justify-center overflow-hidden px-6">

      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.webp"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl z-10 w-full flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Left - Phone */}
        <div className="hidden md:flex flex-1 justify-start">
          <Image
            src="/hero-ph.webp"
            alt="Phone mockup"
            width={600}
            height={900}
            priority
            className="w-80 lg:w-96 h-auto object-contain"
          />
        </div>

        {/* Right - Text */}
        <div className="flex-1 text-center md:text-left">

          <h1 className="font-bebas font-extrabold tracking-tight text-white">
            <span className="block text-5xl sm:text-6xl md:text-8xl lg:text-[130px] lg:leading-20">
              TURN SCREEN
            </span>
            <span className="block text-5xl sm:text-6xl md:text-8xl lg:text-[130px] lg:leading-40">
              TIME INTO
            </span>
            <span className="block text-5xl sm:text-6xl md:text-8xl lg:text-[130px] lg:leading-20 text-[#B1FA63]">
              SMART TIME
            </span>
          </h1>

          <p className="mt-6 mb-10 text-base sm:text-lg text-neutral-400 max-w-md mx-auto md:mx-0">
            Fast mental duels against real players.
          </p>

          <GreenButton label="DOWNLOAD NOW" onClick={onClick} />
        </div>
      </div>
    </section>
  );
};
