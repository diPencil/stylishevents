import { LiveCustomerAssetPreviewPage } from "@/components/admin/live-detail-pages"

export default function EventCardPreviewPage({ params }: { params: { id: string } }) {
  return <LiveCustomerAssetPreviewPage id={params.id} kind="card" />
}
