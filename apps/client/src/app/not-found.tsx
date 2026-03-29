import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full h-screen bg-neutral-900 flex flex-col justify-center items-center text-neutral-50">
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}
