import ProfilePage from "@/pages-x/profilepage";

export default async function profile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;

  return <ProfilePage username={username} />;
}

