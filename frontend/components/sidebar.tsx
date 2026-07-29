"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FolderKanban, Home, LineChart, PieChart, Settings, VideoIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && (pathname || "").startsWith(path)) return true
    return false
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">VideoMetrics.ai</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/projects")}>
                  <Link href="/projects">
                    <FolderKanban className="h-4 w-4" />
                    <span>Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/video-sources")}>
                  <Link href="/video-sources">
                    <VideoIcon className="h-4 w-4" />
                    <span>Video Sources</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/analytics")}>
                  <Link href="/analytics">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/templates")}>
                  <Link href="/templates">
                    <PieChart className="h-4 w-4" />
                    <span>Templates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/alerts")}>
                  <Link href="/alerts">
                    <span className="relative">
                      <span className="absolute -right-1 -top-1 flex h-4 w-4">
                        <span className="absolute inline-flex h-full w-full animate-none rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                          3
                        </span>
                      </span>
                      <LineChart className="h-4 w-4" />
                    </span>
                    <span>Alerts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/reports")}>
                  <Link href="/reports">
                    <LineChart className="h-4 w-4" />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/settings")}>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <ThemeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
