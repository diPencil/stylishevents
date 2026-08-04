"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, CreditCard, Eye, MoreHorizontal, ReceiptText, RefreshCcw, Ticket, User, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminPageHeader, MetricCard, TableSearch } from "@/components/admin/admin-primitives"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { TableDateTime } from "@/components/admin/table-date-time"
import { useLanguage } from "@/contexts/language-context"
import { adminStatusT, adminT } from "@/lib/admin-translations"
import { platformApi } from "@/lib/platform-api"

type BookingStatus = "paid" | "pending" | "cancelled" | "refunded"

type Booking = {
  id: string
  registrationId: number
  customer: string
  email: string
  event: string
  tickets: number
  amount: number
  currency: string
  method: string
  status: BookingStatus
  createdAt: string
}

function normalizeBooking(row: any): Booking {
  const status = row.order_status === "refunded" ? "refunded" : row.order_status === "cancelled" ? "cancelled" : row.order_status === "paid" ? "paid" : row.registration_status === "cancelled" ? "cancelled" : row.payment_status === "approved" ? "paid" : row.payment_status === "rejected" ? "cancelled" : "pending"
  return {
    id: row.order_number || row.registration_number || `REG-${row.id}`,
    registrationId: Number(row.id),
    customer: row.doctor_name || row.customer_name || "Customer",
    email: row.doctor_email || row.customer_email || "",
    event: row.event_title_en || row.event_title_ar || "Event",
    tickets: Number(row.ticket_quantity || 1),
    amount: Number(row.selected_price || row.grand_total || 0),
    currency: row.selected_currency || row.order_currency || row.currency || "USD",
    method: row.payment_reference ? "Bank transfer" : "Pending proof",
    status,
    createdAt: row.created_at || "",
  }
}

function statusClass(status: BookingStatus) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (status === "pending") return "bg-amber-50 text-amber-700 hover:bg-amber-50"
  if (status === "refunded") return "bg-slate-100 text-slate-600 hover:bg-slate-100"
  return "bg-red-50 text-red-700 hover:bg-red-50"
}

function money(value: number, currency = "USD") {
  return `${currency} ${Number(value || 0).toLocaleString()}`
}

export function BookingsManager() {
  const { language } = useLanguage()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    let active = true
    platformApi.listRegistrations()
      .then((rows) => {
        if (active) setBookings((rows || []).map(normalizeBooking))
      })
      .catch((error) => {
        if (active) toast.error("Could not load bookings", { description: error instanceof Error ? error.message : "Check the backend connection." })
      })
    return () => {
      active = false
    }
  }, [])

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return bookings
    return bookings.filter((booking) => `${booking.id} ${booking.customer} ${booking.email} ${booking.event}`.toLowerCase().includes(query))
  }, [bookings, search])

  const totals = useMemo(() => {
    const paidRevenue = bookings.filter((booking) => booking.status === "paid").reduce((sum, booking) => sum + booking.amount, 0)
    const pendingRevenue = bookings.filter((booking) => booking.status === "pending").reduce((sum, booking) => sum + booking.amount, 0)
    const refundedRevenue = bookings.filter((booking) => booking.status === "refunded").reduce((sum, booking) => sum + booking.amount, 0)
    const cancelled = bookings.filter((booking) => booking.status === "cancelled").length
    return { paidRevenue, pendingRevenue, refundedRevenue, cancelled }
  }, [bookings])

  function exportOrders() {
    const headers = ["#", "Order", "Customer", "Email", "Event", "Tickets", "Amount", "Currency", "Method", "Status", "Created"]
    const escape = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`
    const csvRows = filteredBookings.map((booking, index) => [
      index + 1,
      booking.id,
      booking.customer,
      booking.email,
      booking.event,
      booking.tickets,
      booking.amount,
      booking.currency,
      booking.method,
      booking.status,
      booking.createdAt,
    ])
    const csv = [headers, ...csvRows].map((row) => row.map(escape).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "stylish-events-orders.csv"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success("Orders exported", { description: `${filteredBookings.length} booking rows downloaded.` })
  }

  async function updateStatus(booking: Booking, status: BookingStatus) {
    const apiStatus = status === "pending" ? "cancelled" : status
    try {
      await platformApi.updateRegistrationOrderStatus(booking.registrationId, apiStatus)
      setBookings((current) => current.map((item) => item.registrationId === booking.registrationId ? { ...item, status } : item))
      toast.success("Booking updated", { description: `${booking.id} is now ${status}.` })
    } catch (error) {
      toast.error("Booking update failed", { description: error instanceof Error ? error.message : "Could not update this booking." })
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow={adminT(language, "bookings.operations")}
        title={adminT(language, "bookings.title")}
        description={adminT(language, "bookings.subtitle")}
        action={{ label: adminT(language, "bookings.export"), icon: ReceiptText, onClick: exportOrders }}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label={adminT(language, "bookings.paidRevenue")} value={money(totals.paidRevenue)} icon={CreditCard} />
        <MetricCard label={adminT(language, "bookings.pendingRevenue")} value={money(totals.pendingRevenue)} icon={RefreshCcw} />
        <MetricCard label={adminT(language, "bookings.refunded")} value={money(totals.refundedRevenue)} icon={XCircle} />
        <MetricCard label={adminT(language, "bookings.cancelled")} value={totals.cancelled} icon={XCircle} />
      </div>

      <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base font-extrabold">{adminT(language, "bookings.table")}</CardTitle>
            <p className="mt-1 text-sm font-medium text-slate-400">{adminT(language, "bookings.tableCopy")}</p>
          </div>
          <TableSearch value={search} onChange={setSearch} placeholder={adminT(language, "bookings.search")} />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1040px]">
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="w-14">#</TableHead>
                  <TableHead>{language === "ar" ? "الطلب" : "Order"}</TableHead>
                  <TableHead>{adminT(language, "common.customer")}</TableHead>
                  <TableHead>{adminT(language, "common.event")}</TableHead>
                  <TableHead>{adminT(language, "common.tickets")}</TableHead>
                  <TableHead>{adminT(language, "common.amount")}</TableHead>
                  <TableHead>{language === "ar" ? "طريقة الدفع" : "Method"}</TableHead>
                  <TableHead>{adminT(language, "common.status")}</TableHead>
                  <TableHead>{language === "ar" ? "تاريخ الإنشاء" : "Created"}</TableHead>
                  <TableHead className="w-20 text-center">{adminT(language, "common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking, index) => (
                  <TableRow key={booking.id} className="hover:bg-[hsl(var(--primary)/0.04)]">
                    <TableCell className="text-sm font-extrabold text-slate-400">{index + 1}</TableCell>
                    <TableCell><p className="text-sm font-extrabold">{booking.id}</p></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]"><User className="h-4 w-4" /></div>
                        <div>
                          <p className="text-sm font-extrabold">{booking.customer}</p>
                          <p className="text-xs font-medium text-slate-400">{booking.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[240px]"><p className="line-clamp-2 text-sm font-bold text-slate-600">{booking.event}</p></TableCell>
                    <TableCell><Badge className="gap-2 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]"><Ticket className="h-3.5 w-3.5" /> {booking.tickets}</Badge></TableCell>
                    <TableCell className="font-extrabold">{money(booking.amount, booking.currency)}</TableCell>
                    <TableCell className="text-sm font-semibold text-slate-500">{booking.method}</TableCell>
                    <TableCell><Badge className={statusClass(booking.status)}>{adminStatusT(language, booking.status)}</Badge></TableCell>
                    <TableCell><TableDateTime value={booking.createdAt} /></TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-slate-50"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl border-0 p-2 shadow-xl">
                            <DropdownMenuLabel className="text-xs text-slate-400">{adminT(language, "common.actions")}</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 font-semibold">
                              <Link href={`/admin/orders/${booking.registrationId}`}>
                                <Eye className="h-4 w-4" />
                                {adminT(language, "common.viewOrder")}
                              </Link>
                            </DropdownMenuItem>
                            <ConfirmAction title="Mark as paid?" description="This order will be marked as paid." confirmLabel="Mark paid" onConfirm={() => updateStatus(booking, "paid")}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {adminT(language, "common.markPaid")}</DropdownMenuItem>
                            </ConfirmAction>
                            <ConfirmAction title="Refund booking?" description="This order will be marked refunded." confirmLabel="Refund" onConfirm={() => updateStatus(booking, "refunded")}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-slate-600"><RefreshCcw className="h-4 w-4" /> {adminT(language, "common.refund")}</DropdownMenuItem>
                            </ConfirmAction>
                            <DropdownMenuSeparator />
                            <ConfirmAction title="Cancel booking?" description="This booking will be cancelled and attendee QR will be revoked." confirmLabel="Cancel booking" tone="danger" onConfirm={() => updateStatus(booking, "cancelled")}>
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
            {filteredBookings.length === 0 && <div className="p-8 text-center text-sm font-semibold text-slate-400">{adminT(language, "bookings.empty")}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
