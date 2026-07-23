import { LiveReviewDetailPage } from "@/components/admin/live-detail-pages"

export default async function AdminReviewDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LiveReviewDetailPage id={id} />
}
