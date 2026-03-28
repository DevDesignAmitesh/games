import { HomeHeader } from "@/components/homeheader";
import { LeftSideBar } from "@/components/leftsidebar";
import { RightSideBar } from "@/components/rightsidebar";

export default function mainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full bg-neutral-900">
      <div className="w-full max-w-375 mx-auto h-screen flex flex-col">
        <HomeHeader />
        <div className="flex flex-1 overflow-hidden">
          <LeftSideBar />
          <main className="flex-1 overflow-auto">
            {/* Your main content goes here */}
            {children}
          </main>
          <RightSideBar />
        </div>
      </div>
    </div>
  );
}
