import { LiveRegistrationDetailPage } from "@/components/admin/live-detail-pages"

export default function OrderPreviewPage({ params }: { params: { id: string } }) {
  return <LiveRegistrationDetailPage id={params.id} variant="order" />
}
