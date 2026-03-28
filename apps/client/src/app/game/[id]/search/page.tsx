import { OnlineSearchPage } from "@/pages/onlinesearchpage";

export default async function onlineSearch({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  return <OnlineSearchPage />;
}
