type TableDateTimeProps = {
  value?: string
}

function normalizeDateTime(value: string) {
  const parsed = new Date(value)
  const formatted = Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(parsed)

  const [monthDay, year, ...timeParts] = formatted.split(", ")
  return {
    date: [monthDay, year].filter(Boolean).join(", "),
    time: timeParts.join(", "),
  }
}

export function TableDateTime({ value }: TableDateTimeProps) {
  if (!value) return <span className="text-xs font-bold text-slate-500">-</span>

  const { date, time } = normalizeDateTime(value)

  return (
    <div className="min-w-[96px] whitespace-nowrap leading-[1.15]">
      <p className="text-[12px] font-extrabold text-slate-600">{date},</p>
      <p className="mt-1 text-[11px] font-bold text-slate-400">{time}</p>
    </div>
  )
}
