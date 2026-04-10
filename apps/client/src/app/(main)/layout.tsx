import { HomeHeader } from "@/components/homeheader";
import { LeftSideBar } from "@/components/leftsidebar";
import { RightSideBar } from "@/components/rightsidebar";
import { ProtectedRoute } from "@/managers/protectedRoute";

export default function mainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="w-full bg-neutral-900">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col">
          <HomeHeader />
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            <LeftSideBar />
            <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </main>
            <RightSideBar />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
