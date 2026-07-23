import { PortalShell } from "@/components/portal/portal-shell"
import { RoleDashboard } from "@/components/portal/role-dashboard"

export default function CustomerPortalPage() {
  return (
    <PortalShell role="customer">
      <RoleDashboard role="customer" />
    </PortalShell>
  )
}
