import { ResultPage } from "@/pages/resultpage";

export default async function profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  return <ResultPage />;
}
