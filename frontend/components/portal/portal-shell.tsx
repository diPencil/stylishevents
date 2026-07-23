"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Home, QrCode, Settings, Star, UserRound } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

type PortalShellProps = {
  role: "customer" | "organizer" | "employee"
  children: React.ReactNode
}

const roleCopy = {
  customer: { ar: "بوابة العميل", en: "Customer Portal" },
  organizer: { ar: "بوابة المنظم", en: "Organizer Portal" },
  employee: { ar: "بوابة الموظف", en: "Employee Portal" },
}

const nav = [
  { href: "overview", ar: "الرئيسية", en: "Overview", icon: Home },
  { href: "events", ar: "الفعاليات", en: "Events", icon: CalendarDays },
  { href: "qr", ar: "QR", en: "QR", icon: QrCode },
  { href: "reviews", ar: "التقييمات", en: "Reviews", icon: Star },
  { href: "settings", ar: "الإعدادات", en: "Settings", icon: Settings },
]

export function PortalShell({ role, children }: PortalShellProps) {
  const { language, isRtl } = useLanguage()
  const pathname = usePathname()
  const base = role === "customer" ? "/customer" : role === "organizer" ? "/organizer" : "/employee"

  return (
    <div className="min-h-screen bg-slate-50" dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href={base} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold">{roleCopy[role][language]}</p>
              <p className="text-xs text-muted-foreground">Stylish Events</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.slice(0, role === "employee" ? 3 : 5).map((item) => {
              const href = item.href === "overview" ? base : `${base}/${item.href}`
              const active = pathname === href
              const Icon = item.icon
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted-foreground transition hover:bg-slate-100",
                    active && "bg-slate-900 text-white hover:bg-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item[language]}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
    </div>
  )
}
