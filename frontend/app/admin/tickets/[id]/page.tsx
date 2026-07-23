import { LiveRegistrationDetailPage } from "@/components/admin/live-detail-pages"

export default function TicketPreviewPage({ params }: { params: { id: string } }) {
  return <LiveRegistrationDetailPage id={params.id} variant="ticket" />
}
