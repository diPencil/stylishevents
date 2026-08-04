"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3, CalendarDays, Download, FileSpreadsheet, Ticket, TrendingUp, Users } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminPageHeader, MetricCard, TableSearch } from "@/components/admin/admin-primitives"
import { TableDateTime } from "@/components/admin/table-date-time"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"
import { platformApi } from "@/lib/platform-api"
import { cn } from "@/lib/utils"

type ReportRow = {
  id: string
  eventId: number
  event: string
  revenue: number
  currency: string
  bookings: number
  attendees: number
  checkedIn: number
  ticketsSold: number
  capacity: number
  topTicket: string
  updatedAt: string
}

function money(value: number, currency = "USD") {
  return `${currency} ${Number(value || 0).toLocaleString()}`
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0
}

function ProgressLine({ value }: { value: number }) {
  return (
    <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

export function ReportsManager() {
  const { language } = useLanguage()
  const isRtl = language === "ar"
  const [search, setSearch] = useState("")
  const [rows, setRows] = useState<ReportRow[]>([])

  const exportCsv = (mode: "revenue" | "attendance" | "tickets" | "full") => {
    const headers = [
      "Report ID",
      "Event",
      ...(mode === "revenue" || mode === "full" ? ["Revenue", "Currency", "Bookings"] : []),
      ...(mode === "attendance" || mode === "full" ? ["Attendees", "Checked In", "Check-in Rate", "Capacity"] : []),
      ...(mode === "tickets" || mode === "full" ? ["Tickets Sold", "Top Ticket"] : []),
      "Updated At",
    ]

    const csvRows = filteredRows.map((row) => [
      row.id,
      row.event,
      ...(mode === "revenue" || mode === "full" ? [String(row.revenue), row.currency, String(row.bookings)] : []),
      ...(mode === "attendance" || mode === "full" ? [String(row.attendees), String(row.checkedIn), `${percent(row.checkedIn, row.attendees)}%`, String(row.capacity)] : []),
      ...(mode === "tickets" || mode === "full" ? [String(row.ticketsSold), row.topTicket] : []),
      row.updatedAt,
    ])

    const escape = (value: string) => `"${String(value || "").replace(/"/g, '""')}"`
    const csv = [headers, ...csvRows].map((row) => row.map(escape).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `stylish-events-${mode}-report.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success(adminT(language, "reports.exported"), { description: `${filteredRows.length} ${adminT(language, "reports.exportedCopy")}` })
  }

  useEffect(() => {
    let active = true
    async function loadReports() {
      try {
        const [events, registrations, attendees, performance, summary] = await Promise.all([
          platformApi.listEvents(),
          platformApi.reportRegistrations(),
          platformApi.listAttendees(),
          platformApi.reportTicketPerformance(),
          platformApi.reportSummary(),
        ])

        const revenueTotal = (summary?.revenue || []).reduce((sum: number, row: any) => sum + Number(row.total || 0), 0)
        const defaultCurrency = summary?.revenue?.[0]?.currency || "USD"
        const liveRows = (events || []).map((event: any): ReportRow => {
          const eventRegistrations = (registrations || []).filter((registration: any) => Number(registration.event_id) === Number(event.id))
          const eventAttendees = (attendees || []).filter((attendee: any) => Number(attendee.event_id) === Number(event.id))
          const eventPerformance = (performance || []).filter((item: any) => item.event_title_en === event.title_en)
          const topTicket = [...eventPerformance].sort((a: any, b: any) => Number(b.registrations || 0) - Number(a.registrations || 0))[0]
          const eventTitle = language === "ar" ? event.title_ar || event.title_en || "فعالية" : event.title_en || event.title_ar || "Event"
          return {
            id: `RPT-${event.id}`,
            eventId: Number(event.id),
            event: eventTitle,
            revenue: eventRegistrations.reduce((sum: number, item: any) => sum + Number(item.payment_status === "approved" ? item.selected_price || 0 : 0), 0),
            currency: eventRegistrations.find((item: any) => item.selected_currency)?.selected_currency || defaultCurrency,
            bookings: eventRegistrations.length,
            attendees: eventAttendees.length,
            checkedIn: eventAttendees.filter((attendee: any) => attendee.checked_in_at || attendee.qr_status === "used").length,
            ticketsSold: eventPerformance.reduce((sum: number, item: any) => sum + Number(item.registrations || 0), 0),
            capacity: Number(event.max_attendees || event.venue_capacity || 0),
            topTicket: (language === "ar" ? topTicket?.ticket_name_ar || topTicket?.ticket_name_en : topTicket?.ticket_name_en || topTicket?.ticket_name_ar) || "-",
            updatedAt: event.updated_at || event.starts_at || "",
          }
        })

        if (!active) return
        setRows(liveRows)
        if (!liveRows.length && revenueTotal > 0) toast.info(adminT(language, "reports.reportsLoaded"), { description: adminT(language, "reports.reportsLoadedCopy") })
      } catch (error) {
        if (active) toast.error(adminT(language, "reports.loadError"), { description: error instanceof Error ? error.message : adminT(language, "reports.backendError") })
      }
    }
    loadReports()
    return () => {
      active = false
    }
  }, [language])

  const filteredRows = rows.filter((row) => row.event.toLowerCase().includes(search.toLowerCase()))

  const totals = useMemo(() => {
    const revenue = rows.reduce((sum, row) => sum + row.revenue, 0)
    const bookings = rows.reduce((sum, row) => sum + row.bookings, 0)
    const checkedIn = rows.reduce((sum, row) => sum + row.checkedIn, 0)
    const attendees = rows.reduce((sum, row) => sum + row.attendees, 0)
    return { revenue, bookings, checkInRate: percent(checkedIn, attendees), tickets: rows.reduce((sum, row) => sum + row.ticketsSold, 0) }
  }, [rows])

  const renderTable = (mode: "revenue" | "attendance" | "tickets" | "full") => (
    <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
      <CardHeader className={cn("flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between", isRtl && "md:flex-row-reverse text-right")}>
        <div>
          <CardTitle className="text-base font-extrabold">{adminT(language, "reports.table")}</CardTitle>
          <p className="mt-1 text-sm font-medium text-slate-400">{adminT(language, "reports.tableCopy")}</p>
        </div>
        <TableSearch value={search} onChange={setSearch} placeholder={adminT(language, "reports.search")} />
      </CardHeader>
      <CardContent className="p-0">
        <div className={cn("overflow-x-auto", isRtl && "[direction:rtl]")}>
          <Table className={cn("min-w-[1080px]", isRtl && "text-right")}>
            <TableHeader>
              <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                <TableHead className={cn("w-14", isRtl && "text-right")}>#</TableHead>
                <TableHead>{adminT(language, "common.event")}</TableHead>
                {(mode === "revenue" || mode === "full") && <TableHead>{adminT(language, "overview.revenue")}</TableHead>}
                {(mode === "revenue" || mode === "full") && <TableHead>{adminT(language, "nav.orders")}</TableHead>}
                {(mode === "attendance" || mode === "full") && <TableHead>{adminT(language, "nav.attendees")}</TableHead>}
                {(mode === "attendance" || mode === "full") && <TableHead>{adminT(language, "reports.checkInRate")}</TableHead>}
                {(mode === "tickets" || mode === "full") && <TableHead>{adminT(language, "overview.ticketsSold")}</TableHead>}
                {(mode === "tickets" || mode === "full") && <TableHead>{adminT(language, "reports.topTicket")}</TableHead>}
                <TableHead>{adminT(language, "reports.updated")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row, index) => {
                const checkInRate = percent(row.checkedIn, row.attendees)
                return (
                  <TableRow key={row.id} className="hover:bg-[hsl(var(--primary)/0.04)]">
                    <TableCell className="text-sm font-extrabold text-slate-400" dir="ltr">{index + 1}</TableCell>
                    <TableCell className="max-w-[260px]"><p className="line-clamp-2 text-sm font-extrabold text-[#17172f]">{row.event}</p><p className={cn("text-xs font-semibold text-slate-400", isRtl && "inline-block")} dir="ltr">{row.id}</p></TableCell>
                    {(mode === "revenue" || mode === "full") && <TableCell className="text-sm font-extrabold" dir="ltr">{money(row.revenue, row.currency)}</TableCell>}
                    {(mode === "revenue" || mode === "full") && <TableCell className="text-sm font-extrabold" dir="ltr">{row.bookings.toLocaleString()}</TableCell>}
                    {(mode === "attendance" || mode === "full") && <TableCell><p className="text-sm font-extrabold" dir="ltr">{row.attendees.toLocaleString()}</p><p className="text-xs font-bold text-slate-400">{adminT(language, "reports.capacity")} <span dir="ltr">{row.capacity.toLocaleString()}</span></p></TableCell>}
                    {(mode === "attendance" || mode === "full") && <TableCell><div className="space-y-2"><p className="text-sm font-extrabold" dir="ltr">{checkInRate}%</p><ProgressLine value={checkInRate} /></div></TableCell>}
                    {(mode === "tickets" || mode === "full") && <TableCell className="text-sm font-extrabold" dir="ltr">{row.ticketsSold.toLocaleString()}</TableCell>}
                    {(mode === "tickets" || mode === "full") && <TableCell><Badge className="gap-2 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]"><Ticket className="h-3.5 w-3.5" /> {row.topTicket}</Badge></TableCell>}
                    <TableCell><TableDateTime value={row.updatedAt} /></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filteredRows.length === 0 && <div className="p-8 text-center text-sm font-semibold text-slate-400">{adminT(language, "reports.noRows")}</div>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="admin-reports-page space-y-5">
      <AdminPageHeader
        eyebrow={adminT(language, "reports.analyticsCenter")}
        title={adminT(language, "reports.title")}
        description={adminT(language, "reports.subtitle")}
        action={{ label: adminT(language, "reports.export"), icon: Download, onClick: () => exportCsv("full") }}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label={adminT(language, "reports.totalRevenue")} value={money(totals.revenue)} icon={TrendingUp} />
        <MetricCard label={adminT(language, "nav.orders")} value={totals.bookings.toLocaleString()} icon={CalendarDays} />
        <MetricCard label={adminT(language, "reports.checkInRate")} value={`${totals.checkInRate}%`} icon={Users} />
        <MetricCard label={adminT(language, "overview.ticketsSold")} value={totals.tickets.toLocaleString()} icon={Ticket} />
      </div>

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="admin-reports-tabs grid h-auto w-full grid-cols-2 rounded-2xl bg-white/70 p-1 sm:grid-cols-3 lg:w-[820px] lg:grid-cols-5">
          <TabsTrigger value="overview" className="rounded-xl">{adminT(language, "reports.overview")}</TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-xl">{adminT(language, "reports.revenue")}</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-xl">{adminT(language, "reports.attendance")}</TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-xl">{adminT(language, "reports.tickets")}</TabsTrigger>
          <TabsTrigger value="exports" className="rounded-xl">{adminT(language, "reports.exports")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">{renderTable("full")}</TabsContent>
        <TabsContent value="revenue">{renderTable("revenue")}</TabsContent>
        <TabsContent value="attendance">{renderTable("attendance")}</TabsContent>
        <TabsContent value="tickets">{renderTable("tickets")}</TabsContent>
        <TabsContent value="exports">
          <div className="grid gap-5 md:grid-cols-3">
            {["Revenue CSV", "Attendance XLSX", "Tickets PDF"].map((item) => (
              <Card key={item} className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
                <CardContent className="p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]"><FileSpreadsheet className="h-5 w-5" /></div>
                  <p className="mt-4 text-base font-extrabold text-[#17172f]">{item}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-400">{adminT(language, "reports.exportReady")}</p>
                  <Button
                    onClick={() => exportCsv(item.includes("Revenue") ? "revenue" : item.includes("Attendance") ? "attendance" : "tickets")}
                    className="mt-5 h-10 rounded-2xl bg-[hsl(var(--primary))] px-4 text-sm font-extrabold text-white"
                  >
                    <Download className="h-4 w-4" /> {adminT(language, "common.download")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
        <CardHeader><CardTitle className={cn("flex items-center gap-2 text-base font-extrabold", isRtl && "flex-row-reverse text-right")}><BarChart3 className="h-5 w-5 text-[hsl(var(--primary))]" /> {adminT(language, "reports.performanceSnapshot")}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {rows.map((row) => {
            const rate = percent(row.checkedIn, row.attendees)
            return (
              <div key={row.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="line-clamp-1 text-sm font-extrabold text-[#17172f]">{row.event}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">{adminT(language, "reports.attendance")} <span dir="ltr">{rate}%</span></p>
                <div className="mt-3"><ProgressLine value={rate} /></div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
