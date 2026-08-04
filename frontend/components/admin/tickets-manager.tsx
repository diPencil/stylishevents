"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Clock3, CreditCard, Download, Eye, MoreHorizontal, Ticket, UserCheck, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminPageHeader, MetricCard, TableSearch } from "@/components/admin/admin-primitives"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { TableDateTime } from "@/components/admin/table-date-time"
import { useLanguage } from "@/contexts/language-context"
import { adminStatusT, adminT } from "@/lib/admin-translations"
import { platformApi } from "@/lib/platform-api"

type BookingStatus = "confirmed" | "pending" | "cancelled" | "checked_in"
type PaymentStatus = "paid" | "unpaid" | "refunded"

type TicketBooking = {
  id: string
  registrationId: number
  event: string
  customer: string
  email: string
  ticketType: string
  quantity: number
  amount: string
  bookingStatus: BookingStatus
  paymentStatus: PaymentStatus
  qrToken: string
  bookedAt: string
  checkedInAt?: string
}

function normalizeTicketBooking(row: any, attendee?: any): TicketBooking {
  const paid = row.payment_status === "approved"
  const cancelled = row.registration_status === "cancelled" || row.order_status === "cancelled"
  const checkedInAt = attendee?.checked_in_at || row.checked_in_at
  return {
    id: row.ticket_number || row.registration_number || `REG-${row.id}`,
    registrationId: Number(row.id),
    event: row.event_title_en || row.event_title_ar || "Event",
    customer: row.doctor_name || row.customer_name || attendee?.full_name || "Customer",
    email: row.doctor_email || row.customer_email || attendee?.email || "",
    ticketType: row.ticket_name_en || row.ticket_name_ar || "Ticket",
    quantity: Number(row.ticket_quantity || 1),
    amount: `${row.selected_currency || "USD"} ${Number(row.selected_price || 0).toLocaleString()}`,
    bookingStatus: cancelled ? "cancelled" : checkedInAt ? "checked_in" : paid ? "confirmed" : "pending",
    paymentStatus: row.order_status === "refunded" ? "refunded" : paid ? "paid" : "unpaid",
    qrToken: attendee?.qr_token || row.qr_token || "",
    bookedAt: row.created_at || "",
    checkedInAt,
  }
}

function statusClass(status: BookingStatus) {
  if (status === "checked_in") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (status === "confirmed") return "bg-blue-50 text-blue-700 hover:bg-blue-50"
  if (status === "cancelled") return "bg-red-50 text-red-700 hover:bg-red-50"
  return "bg-amber-50 text-amber-700 hover:bg-amber-50"
}

function paymentClass(status: PaymentStatus) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (status === "refunded") return "bg-slate-100 text-slate-600 hover:bg-slate-100"
  return "bg-amber-50 text-amber-700 hover:bg-amber-50"
}

export function TicketsManager() {
  const { language } = useLanguage()
  const [bookings, setBookings] = useState<TicketBooking[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    let active = true
    async function loadTickets() {
      try {
        const [registrations, attendees] = await Promise.all([platformApi.listRegistrations(), platformApi.listAttendees()])
        const mapped = (registrations || []).map((registration: any) => {
          const attendee = (attendees || []).find((item: any) => item.email === registration.doctor_email && Number(item.event_id) === Number(registration.event_id))
          return normalizeTicketBooking(registration, attendee)
        })
        if (active) setBookings(mapped)
      } catch (error) {
        if (active) toast.error("Could not load ticket buyers", { description: error instanceof Error ? error.message : "Check the backend connection." })
      }
    }
    loadTickets()
    return () => {
      active = false
    }
  }, [])

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return bookings
    return bookings.filter((booking) => `${booking.id} ${booking.customer} ${booking.email} ${booking.event} ${booking.ticketType}`.toLowerCase().includes(query))
  }, [bookings, search])

  const totals = useMemo(() => {
    const totalTickets = bookings.reduce((sum, booking) => sum + booking.quantity, 0)
    const checkedIn = bookings.filter((booking) => booking.bookingStatus === "checked_in").length
    const cancelled = bookings.filter((booking) => booking.bookingStatus === "cancelled").length
    const confirmed = bookings.filter((booking) => booking.bookingStatus === "confirmed" || booking.bookingStatus === "checked_in").length
    const paid = bookings.filter((booking) => booking.paymentStatus === "paid").length
    const unpaid = bookings.filter((booking) => booking.paymentStatus === "unpaid").length
    const refunded = bookings.filter((booking) => booking.paymentStatus === "refunded").length
    return { totalTickets, checkedIn, cancelled, confirmed, paid, unpaid, refunded }
  }, [bookings])

  function exportTickets() {
    const headers = ["#", "Booking", "Customer", "Email", "Event", "Ticket", "Quantity", "Amount", "Booking Status", "Payment Status", "QR Token", "Booked At", "Checked In At"]
    const escape = (value: string | number | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`
    const csvRows = filteredBookings.map((booking, index) => [
      index + 1,
      booking.id,
      booking.customer,
      booking.email,
      booking.event,
      booking.ticketType,
      booking.quantity,
      booking.amount,
      booking.bookingStatus,
      booking.paymentStatus,
      booking.qrToken,
      booking.bookedAt,
      booking.checkedInAt || "",
    ])
    const csv = [headers, ...csvRows].map((row) => row.map(escape).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "stylish-events-ticket-buyers.csv"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success("Tickets exported", { description: `${filteredBookings.length} ticket buyer rows downloaded.` })
  }

  async function checkInBooking(booking: TicketBooking) {
    if (!booking.qrToken) {
      toast.error("No QR token", { description: "Approve payment first to generate attendee QR." })
      return
    }
    try {
      const result = await platformApi.checkin(booking.qrToken)
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, bookingStatus: "checked_in", checkedInAt: result.checked_in_at || new Date().toISOString() } : item))
      toast.success("Ticket checked in", { description: booking.customer })
    } catch (error) {
      toast.error("Check-in failed", { description: error instanceof Error ? error.message : "Could not check in this ticket." })
    }
  }

  async function cancelBooking(booking: TicketBooking) {
    try {
      await platformApi.updateRegistrationOrderStatus(booking.registrationId, "cancelled")
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, bookingStatus: "cancelled" } : item))
      toast.success("Ticket booking cancelled")
    } catch (error) {
      toast.error("Cancel failed", { description: error instanceof Error ? error.message : "Could not cancel this ticket." })
    }
  }

  const attendanceRate = bookings.length ? Math.round((totals.checkedIn / bookings.length) * 100) : 0

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow={adminT(language, "ticketsPage.operations")}
        title={adminT(language, "ticketsPage.title")}
        description={adminT(language, "ticketsPage.subtitle")}
        action={{ label: adminT(language, "ticketsPage.export"), icon: Download, onClick: exportTickets }}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label={adminT(language, "ticketsPage.bookedTickets")} value={totals.totalTickets} icon={Ticket} />
        <MetricCard label={adminT(language, "ticketsPage.confirmedBookings")} value={totals.confirmed} icon={CheckCircle2} />
        <MetricCard label={adminT(language, "bookings.cancelled")} value={totals.cancelled} icon={XCircle} />
        <MetricCard label={adminT(language, "ticketsPage.checkedInLive")} value={totals.checkedIn} icon={UserCheck} />
      </div>

      <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base font-extrabold">{adminT(language, "ticketsPage.table")}</CardTitle>
            <p className="mt-1 text-sm font-medium text-slate-400">{adminT(language, "ticketsPage.tableCopy")}</p>
          </div>
          <TableSearch value={search} onChange={setSearch} placeholder={adminT(language, "ticketsPage.search")} />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1080px]">
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="w-14">#</TableHead>
                  <TableHead>{language === "ar" ? "الحجز" : "Booking"}</TableHead>
                  <TableHead>{adminT(language, "common.customer")}</TableHead>
                  <TableHead>{adminT(language, "common.event")}</TableHead>
                  <TableHead>{adminT(language, "common.ticket")}</TableHead>
                  <TableHead>{language === "ar" ? "العدد" : "Qty"}</TableHead>
                  <TableHead>{adminT(language, "common.amount")}</TableHead>
                  <TableHead>{language === "ar" ? "حالة الحجز" : "Booking"}</TableHead>
                  <TableHead>{adminT(language, "common.payment")}</TableHead>
                  <TableHead>{language === "ar" ? "الحضور" : "Check-in"}</TableHead>
                  <TableHead className="w-20 text-center">{adminT(language, "common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking, index) => (
                  <TableRow key={booking.id} className="hover:bg-[hsl(var(--primary)/0.04)]">
                    <TableCell className="text-sm font-extrabold text-slate-400">{index + 1}</TableCell>
                    <TableCell>
                      <p className="text-sm font-extrabold">{booking.id}</p>
                      <div className="mt-1"><TableDateTime value={booking.bookedAt} /></div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-extrabold">{booking.customer}</p>
                      <p className="text-xs font-medium text-slate-400">{booking.email}</p>
                    </TableCell>
                    <TableCell className="max-w-[220px]"><p className="line-clamp-2 text-sm font-bold text-slate-600">{booking.event}</p></TableCell>
                    <TableCell><Badge className="gap-2 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]"><Ticket className="h-3.5 w-3.5" /> {booking.ticketType}</Badge></TableCell>
                    <TableCell className="font-extrabold">{booking.quantity}</TableCell>
                    <TableCell className="font-extrabold">{booking.amount}</TableCell>
                    <TableCell><Badge className={statusClass(booking.bookingStatus)}>{adminStatusT(language, booking.bookingStatus)}</Badge></TableCell>
                    <TableCell><Badge className={paymentClass(booking.paymentStatus)}>{adminStatusT(language, booking.paymentStatus)}</Badge></TableCell>
                    <TableCell><TableDateTime value={booking.checkedInAt} /></TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-slate-50"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl border-0 p-2 shadow-xl">
                            <DropdownMenuLabel className="text-xs text-slate-400">{adminT(language, "common.actions")}</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 font-semibold">
                              <Link href={`/admin/tickets/${booking.registrationId}`}><Eye className="h-4 w-4" /> {adminT(language, "common.viewTicket")}</Link>
                            </DropdownMenuItem>
                            <ConfirmAction title="Check-in attendee?" description="This ticket QR will be checked in through the backend." confirmLabel="Check in" onConfirm={() => checkInBooking(booking)}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-emerald-600"><UserCheck className="h-4 w-4" /> {adminT(language, "common.markCheckedIn")}</DropdownMenuItem>
                            </ConfirmAction>
                            <ConfirmAction title="Cancel ticket booking?" description="This booking will be cancelled." confirmLabel="Cancel booking" tone="danger" onConfirm={() => cancelBooking(booking)}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-red-600"><XCircle className="h-4 w-4" /> {adminT(language, "common.cancelBooking")}</DropdownMenuItem>
                            </ConfirmAction>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredBookings.length === 0 && <div className="p-8 text-center text-sm font-semibold text-slate-400">{adminT(language, "ticketsPage.empty")}</div>}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base font-extrabold"><Clock3 className="h-4 w-4 text-[hsl(var(--primary))]" /> {adminT(language, "ticketsPage.liveAttendance")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold">{attendanceRate}%</p>
            <p className="mt-1 text-sm font-medium text-slate-400">{adminT(language, "ticketsPage.liveAttendanceCopy")}</p>
            <Progress value={attendanceRate} className="mt-4 h-3 bg-slate-100 [&>div]:bg-[hsl(var(--primary))]" />
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base font-extrabold"><CreditCard className="h-4 w-4 text-[hsl(var(--primary))]" /> {adminT(language, "ticketsPage.paymentHealth")}</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <Health label={adminT(language, "ticketsPage.paid")} value={totals.paid} />
            <Health label={adminT(language, "ticketsPage.unpaid")} value={totals.unpaid} />
            <Health label={adminT(language, "bookings.refunded")} value={totals.refunded} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Health({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-[#17172f]">{value}</p>
    </div>
  )
}
