import { ProfilePage } from "@/pages/profilepage";

export default async function profile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const userName = (await params).username;
  // TODO: get details here according to user-name

  return <ProfilePage />;
}
