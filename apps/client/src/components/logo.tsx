// TODO: it should redirect accordingly according to user's auth state

import Image from "next/image";
import Link from "next/link";

export const Logo = ({ type }: { type: "footer" | "header" }) => {
  if (type === "footer") {
    return (
      <Link href={"/"}>
        <Image
          unoptimized
          src={"/logo.svg"}
          alt="logo"
          width={100}
          height={100}
          className="w-60"
        />
      </Link>
    );
  } else if (type === "header") {
    return (
      <Link href={"/"}>
        <Image
          unoptimized
          src={"/logo-2.png"}
          alt="logo"
          width={100}
          height={100}
          className="w-12"
        />
      </Link>
    );
  }
};
