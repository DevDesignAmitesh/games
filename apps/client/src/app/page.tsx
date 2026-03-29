import { ProtectedRoute } from "@/managers/protectedRoute";
import { LandingPage } from "@/pages/landingpage";

export default function Home() {
  return (
    <ProtectedRoute>
      <LandingPage />
    </ProtectedRoute>
  );
}
