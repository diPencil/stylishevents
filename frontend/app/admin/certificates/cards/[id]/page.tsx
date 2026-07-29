import { LiveCustomerAssetPreviewPage } from "@/components/admin/live-detail-pages"

export default async function EventCardPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LiveCustomerAssetPreviewPage id={id} kind="card" />
}
