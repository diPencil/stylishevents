import { UserPortal } from "@/components/portal/user-portal"

export default async function RegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UserPortal view="registration-detail" recordId={id} />
}
