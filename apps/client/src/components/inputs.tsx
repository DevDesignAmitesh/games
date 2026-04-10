interface GreenInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
  focus?: boolean
}

export const GreenInput = ({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  focus = true
}: GreenInputProps) => {
  return (
    <div className="relative inline-block w-full max-w-80">
      <div
        className="relative z-10 w-full
        flex items-center gap-3
        px-5 py-3 sm:py-4
        rounded-xl
        bg-neutral-900 border border-[#B1FA63]
        focus-within:ring-2 focus-within:ring-[#B1FA63]/40
        transition-all"
      >
        {/* Left Icon (optional) */}
        {icon && (
          <span className="flex items-center text-neutral-400">{icon}</span>
        )}

        {/* Input */}
        <input
          autoFocus={focus}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none
          text-neutral-50 font-bold font-nuni
          text-xs sm:text-sm placeholder:text-neutral-500"
        />
      </div>

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
