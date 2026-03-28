export const DropdownItem = ({
  icon,
  text,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  color: string;
}) => {
  const colorMap: Record<string, string> = {
    green: "group-hover:text-green-400 text-green-400",
    blue: "group-hover:text-blue-400 text-blue-400",
    yellow: "group-hover:text-yellow-400 text-yellow-400",
    orange: "group-hover:text-orange-400 text-orange-400",
    purple: "group-hover:text-purple-400 text-purple-400",
    neutral: "group-hover:text-neutral-300 text-neutral-400",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-700/50 transition-all duration-150 group cursor-pointer">
      <div
        className={`w-5 h-5 flex items-center justify-center ${colorMap[color]}`}
      >
        {icon}
      </div>
      <span className="text-white font-medium text-sm group-hover:text-inherit">
        {text}
      </span>
    </div>
  );
};
