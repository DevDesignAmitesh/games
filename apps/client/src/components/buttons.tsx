import { ReactElement } from "react";
import { FaArrowRight } from "react-icons/fa";

interface ButtonProps {
  label?: string;
  onClick: () => void;
}

interface ButtonIconProps extends ButtonProps {
  icon: ReactElement;
}

export const GreenButton = ({ label, onClick }: ButtonProps) => {
  return (
    <div className="relative inline-block w-full max-w-65">
      <button
        onClick={onClick}
        className="relative z-10 w-full
        py-3 sm:py-4
        rounded-xl cursor-pointer
        bg-neutral-900 border border-[#B1FA63]
        text-neutral-50 font-bold font-nuni
        text-sm sm:text-base
        transition-all active:translate-y-0.5"
      >
        {label}
      </button>

      {/* Band */}
      <div
        className="absolute left-0 right-0
        -bottom-1
        h-4 sm:h-5
        bg-[#B1FA63]
        rounded-full"
      />
    </div>
  );
};

export const GreenIconButton = ({ label, onClick, icon }: ButtonIconProps) => {
  return (
    <div className="relative inline-block w-full max-w-80">
      <button
        onClick={onClick}
        className="relative z-10 w-full
        flex items-center justify-between gap-3
        px-5 py-3 sm:py-4
        rounded-xl cursor-pointer
        bg-neutral-900 border border-[#B1FA63]
        text-neutral-50 font-bold font-nuni
        text-xs
        transition-all active:translate-y-0.5"
      >
        {/* Left Icon */}
        <span className="flex items-center">{icon}</span>

        {/* Label */}
        <span className="flex-1 text-center">{label}</span>

        {/* Right Arrow */}
        <FaArrowRight className="text-sm sm:text-base" />
      </button>

      {/* Band */}
      <div
        className="absolute left-0 right-0
        -bottom-2
        h-4 sm:h-5
        bg-[#B1FA63]
        rounded-full"
      />
    </div>
  );
};

export const GrayIconButton = ({ label, onClick, icon }: ButtonIconProps) => {
  return (
    <div className="relative inline-block w-full max-w-80">
      <button
        onClick={onClick}
        className="relative z-10 w-full
        flex items-center justify-between gap-3
        px-5 py-3 sm:py-4
        rounded-xl cursor-pointer
        bg-neutral-900 border border-neutral-500
        text-neutral-50 font-bold font-nuni
        text-xs
        transition-all active:translate-y-0.5"
      >
        {/* Left Icon */}
        <span className="flex items-center">{icon}</span>

        {/* Label */}
        <span className="flex-1 text-center">{label}</span>

        {/* Right Arrow */}
        <FaArrowRight className="text-sm sm:text-base" />
      </button>

      {/* Band */}
      <div
        className="absolute left-0 right-0
        -bottom-2
        h-4 sm:h-5
        bg-neutral-500
        rounded-full"
      />
    </div>
  );
};

export const GrayButton = ({ label, onClick }: ButtonProps) => {
  return (
    <div className="relative inline-block w-full max-w-65">
      <button
        onClick={onClick}
        className="relative z-10 w-full
        py-3 sm:py-4
        rounded-xl cursor-pointer
        bg-neutral-900 border border-neutral-600
        text-neutral-400 font-bold font-nuni
        text-sm sm:text-base
        transition-all active:translate-y-0.5"
      >
        {label}
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
  );
};

export const BlackButton = ({ label, onClick }: ButtonProps) => {
  return (
    <div className="relative inline-block w-full max-w-65">
      <button
        onClick={onClick}
        className="relative z-10 w-full
        py-3 sm:py-4
        rounded-xl cursor-pointer
        bg-neutral-900 border border-neutral-900
        text-[#B1FA63] font-bold font-nuni
        text-sm sm:text-base
        transition-all active:translate-y-0.5"
      >
        {label}
      </button>

      {/* Band */}
      <div
        className="absolute left-0 right-0
        -bottom-1
        h-4 sm:h-5
        bg-black/60
        rounded-full"
      />
    </div>
  );
};

export const OutlineButton = ({ label, onClick }: ButtonProps) => {
  return (
    <div className="relative inline-block w-full max-w-65">
      <button
        onClick={onClick}
        className="relative z-10 w-full
        py-3 sm:py-4
        rounded-xl cursor-pointer
        bg-[#B1FA63] border border-neutral-900
        text-neutral-900 font-bold font-nuni
        text-sm sm:text-base
        transition-all active:translate-y-0.5"
      >
        {label}
      </button>

      {/* Band */}
      <div
        className="absolute left-0 right-0
        -bottom-1
        h-4 sm:h-5
        bg-neutral-900
        rounded-full"
      />
    </div>
  );
};
