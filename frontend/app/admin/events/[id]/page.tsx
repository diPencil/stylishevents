import { LiveEventDetailPage } from "@/components/admin/live-detail-pages"

export default function EventPreviewPage({ params }: { params: { id: string } }) {
  return <LiveEventDetailPage id={params.id} initialMode="preview" />
}
