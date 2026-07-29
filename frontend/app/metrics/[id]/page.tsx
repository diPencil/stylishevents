import MetricsClient from "./metrics-client";

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <MetricsClient params={resolvedParams} />;
}
