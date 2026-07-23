import { PortalShell } from "@/components/portal/portal-shell"
import { RoleDashboard } from "@/components/portal/role-dashboard"

export default function OrganizerPortalPage() {
  return (
    <PortalShell role="organizer">
      <RoleDashboard role="organizer" />
    </PortalShell>
  )
}
