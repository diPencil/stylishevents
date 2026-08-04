import type { LucideIcon } from "lucide-react"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  action?: {
    label: string
    icon?: LucideIcon
    onClick?: () => void
  }
}

type MetricCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
}

type TableSearchProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder: string
}

export function AdminPageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  const ActionIcon = action?.icon
  const { isRtl } = useLanguage()

  return (
    <div className={cn("flex flex-col justify-between gap-4 md:flex-row md:items-end", isRtl && "md:flex-row-reverse")}>
      <div className={cn(isRtl && "text-right")}>
        <Badge className="mb-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">{eyebrow}</Badge>
        <h1 className="text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">{description}</p>
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          className="h-10 rounded-2xl bg-[hsl(var(--primary))] px-4 text-sm font-extrabold text-white hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  const { isRtl } = useLanguage()

  return (
    <Card className="rounded-[24px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
      <CardContent className={cn("flex items-center gap-3 p-4", isRtl && "flex-row-reverse text-right")}>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-lg font-extrabold text-[#17172f]">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function TableSearch({ value, onChange, placeholder }: TableSearchProps) {
  const { isRtl } = useLanguage()

  return (
    <div className={cn("flex h-10 items-center gap-2 rounded-2xl bg-[#f8f5fb] px-3 md:w-80", isRtl && "flex-row-reverse")}>
      <Search className="h-4 w-4 text-slate-400" />
      <Input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        dir={isRtl ? "rtl" : "ltr"}
        className={cn("h-9 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0", isRtl && "text-right")}
        placeholder={placeholder}
      />
    </div>
  )
}
