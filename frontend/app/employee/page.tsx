import { PortalShell } from "@/components/portal/portal-shell"
import { RoleDashboard } from "@/components/portal/role-dashboard"

export default function EmployeePortalPage() {
  return (
    <PortalShell role="employee">
      <RoleDashboard role="employee" />
    </PortalShell>
  )
}
