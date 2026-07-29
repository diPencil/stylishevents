import { UserPortal } from "@/components/portal/user-portal"

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UserPortal view="ticket-detail" recordId={id} />
}
