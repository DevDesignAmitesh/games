import GamePage from "@/pages-x/gamepage";

export default async function profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  return <GamePage gameId={id} />;
}
