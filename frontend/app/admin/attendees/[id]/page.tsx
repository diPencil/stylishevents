import { LiveAttendeeDetailPage } from "@/components/admin/live-detail-pages"

export default function AttendeeDetailsPage({ params }: { params: { id: string } }) {
  return <LiveAttendeeDetailPage id={params.id} />
}
