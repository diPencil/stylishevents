import { LiveRegistrationDetailPage } from "@/components/admin/live-detail-pages"

export default async function OrderPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LiveRegistrationDetailPage id={id} variant="order" />
}
