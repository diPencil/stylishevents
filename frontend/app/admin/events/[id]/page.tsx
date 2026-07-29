import { LiveEventDetailPage } from "@/components/admin/live-detail-pages"

export default async function EventPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LiveEventDetailPage id={id} initialMode="preview" />
}
