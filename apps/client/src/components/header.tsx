import Link from "next/link";
import { Logo } from "./logo";

interface HeaderProps {
  onClick: () => void;
}

export const Header = ({ onClick }: HeaderProps) => {
  return (
    <header className="w-full font-nuni py-6 font-semibold md:px-0 px-10">
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center text-neutral-50">
        <Logo type="header" />

        {/* nav items */}
        <div className="flex justify-center items-center gap-20">
          <Link href={"#"} className="hover:underline md:block hidden">
            Privacy Policy
          </Link>
          <Link href={"#"} className="hover:underline md:block hidden">
            Blogs
          </Link>
          <button
            onClick={onClick}
            className="border border-neutral-500 md:py-4 py-3 md:px-8 px-4 md:text-base text-sm cursor-pointer"
          >
            Play On Desktop
          </button>
        </div>
      </div>
    </header>
  );
};
