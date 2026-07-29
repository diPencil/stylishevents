import { LiveAttendeeDetailPage } from "@/components/admin/live-detail-pages"

export default async function AttendeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LiveAttendeeDetailPage id={id} />
}
