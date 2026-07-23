import { LiveEventDetailPage } from "@/components/admin/live-detail-pages"

export default function EventEditPage({ params }: { params: { id: string } }) {
  return <LiveEventDetailPage id={params.id} initialMode="edit" />
}
