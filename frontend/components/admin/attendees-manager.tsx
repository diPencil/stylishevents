"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BadgeCheck, Download, Eye, MoreHorizontal, Search, Ticket, UserCheck, Users, XCircle } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { TableDateTime } from "@/components/admin/table-date-time"
import { useLanguage } from "@/contexts/language-context"
import { adminStatusT, adminT } from "@/lib/admin-translations"
import { platformApi } from "@/lib/platform-api"

type AttendeeStatus = "registered" | "checked_in" | "cancelled"
type CertificateStatus = "ready" | "pending" | "sent"

type Attendee = {
  id: number
  attendeeNumber: string
  name: string
  email: string
  phone: string
  event: string
  ticket: string
  qrToken: string
  qrStatus: string
  status: AttendeeStatus
  certificate: CertificateStatus
  registeredAt: string
  checkedInAt?: string
}

function normalizeAttendee(row: any): Attendee {
  const checkedIn = Boolean(row.checked_in_at)
  const revoked = row.qr_status === "revoked"
  return {
    id: Number(row.id),
    attendeeNumber: row.attendee_number || `ATT-${row.id}`,
    name: row.full_name || "Attendee",
    email: row.email || "",
    phone: row.phone || "",
    event: row.event_title_en || row.event_title_ar || "Event",
    ticket: row.ticket_name_en || row.ticket_name_ar || "Ticket",
    qrToken: row.qr_token || "",
    qrStatus: row.qr_status || "active",
    status: revoked ? "cancelled" : checkedIn ? "checked_in" : "registered",
    certificate: row.certificate_issued_at ? "sent" : checkedIn ? "ready" : "pending",
    registeredAt: row.created_at || "",
    checkedInAt: row.checked_in_at || undefined,
  }
}

function statusClass(status: AttendeeStatus) {
  if (status === "checked_in") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (status === "cancelled") return "bg-red-50 text-red-700 hover:bg-red-50"
  return "bg-blue-50 text-blue-700 hover:bg-blue-50"
}

function certificateClass(status: CertificateStatus) {
  if (status === "sent") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (status === "ready") return "bg-purple-50 text-purple-700 hover:bg-purple-50"
  return "bg-amber-50 text-amber-700 hover:bg-amber-50"
}

export function AttendeesManager() {
  const { language } = useLanguage()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    let active = true
    platformApi.listAttendees()
      .then((rows) => {
        if (active) setAttendees((rows || []).map(normalizeAttendee))
      })
      .catch((error) => {
        if (active) toast.error("Could not load attendees", { description: error instanceof Error ? error.message : "Check the backend connection." })
      })
    return () => {
      active = false
    }
  }, [])

  const filteredAttendees = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return attendees
    return attendees.filter((attendee) => `${attendee.name} ${attendee.email} ${attendee.event} ${attendee.ticket}`.toLowerCase().includes(query))
  }, [attendees, search])

  const totals = useMemo(() => {
    const checkedIn = attendees.filter((attendee) => attendee.status === "checked_in").length
    const cancelled = attendees.filter((attendee) => attendee.status === "cancelled").length
    const certificatesReady = attendees.filter((attendee) => attendee.certificate === "ready" || attendee.certificate === "sent").length
    return { checkedIn, cancelled, certificatesReady }
  }, [attendees])

  async function checkIn(attendee: Attendee) {
    try {
      const result = await platformApi.checkin(attendee.qrToken)
      setAttendees((current) => current.map((item) => item.id === attendee.id ? normalizeAttendee({ ...item, ...result, checked_in_at: result.checked_in_at || new Date().toISOString(), qr_status: "used" }) : item))
      toast.success("Attendee checked in", { description: attendee.name })
    } catch (error) {
      toast.error("Check-in failed", { description: error instanceof Error ? error.message : "Could not check in attendee." })
    }
  }

  async function cancel(attendee: Attendee) {
    try {
      await platformApi.updateAttendeeQrStatus(attendee.id, "revoked")
      setAttendees((current) => current.map((item) => item.id === attendee.id ? { ...item, status: "cancelled", qrStatus: "revoked" } : item))
      toast.success("Attendee cancelled", { description: "QR token was revoked." })
    } catch (error) {
      toast.error("Cancel failed", { description: error instanceof Error ? error.message : "Could not revoke QR token." })
    }
  }

  async function sendCertificate(attendee: Attendee) {
    try {
      await platformApi.issueCertificate({ attendeeId: attendee.id, templateKey: "default" })
      setAttendees((current) => current.map((item) => item.id === attendee.id ? { ...item, certificate: "sent" } : item))
      toast.success("Certificate issued", { description: attendee.name })
    } catch (error) {
      toast.error("Certificate failed", { description: error instanceof Error ? error.message : "Certificates can be issued after check-in." })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">{language === "ar" ? "عمليات الحضور" : "Attendees Operations"}</Badge>
          <h1 className="text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">{adminT(language, "attendees.title")}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
            {language === "ar" ? "ملفات الحضور والتذاكر وحالة QR والحضور وتسليم الشهادات." : "Live attendee profiles, tickets, QR status, check-in state, and certificate delivery."}
          </p>
        </div>
        <Button className="h-10 rounded-2xl bg-[hsl(var(--primary))] px-4 text-sm font-extrabold text-white">
          <Download className="h-4 w-4" />
          {adminT(language, "attendees.export")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label={language === "ar" ? "إجمالي الحضور" : "Total Attendees"} value={attendees.length} icon={Users} />
        <Metric label={adminT(language, "overview.checkedIn")} value={totals.checkedIn} icon={UserCheck} />
        <Metric label={adminT(language, "overview.certificates")} value={totals.certificatesReady} icon={BadgeCheck} />
        <Metric label={adminT(language, "bookings.cancelled")} value={totals.cancelled} icon={XCircle} />
      </div>

      <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base font-extrabold">{adminT(language, "attendees.table")}</CardTitle>
            <p className="mt-1 text-sm font-medium text-slate-400">{language === "ar" ? "كل عميل مرتبط بتذكرة وحالة حضور وشهادة." : "Every customer connected to a ticket, attendance state, and certificate."}</p>
          </div>
          <div className="flex h-10 items-center gap-2 rounded-2xl bg-[#f8f5fb] px-3 md:w-80">
            <Search className="h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" placeholder={language === "ar" ? "ابحث عن حضور أو فعالية..." : "Search attendee or event..."} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1080px]">
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="w-14">#</TableHead>
                  <TableHead>{language === "ar" ? "الحاضر" : "Attendee"}</TableHead>
                  <TableHead>{adminT(language, "common.event")}</TableHead>
                  <TableHead>{adminT(language, "common.ticket")}</TableHead>
                  <TableHead>{adminT(language, "common.status")}</TableHead>
                  <TableHead>{adminT(language, "certificates.certificate")}</TableHead>
                  <TableHead>{language === "ar" ? "التسجيل" : "Registered"}</TableHead>
                  <TableHead>{language === "ar" ? "الحضور" : "Check-in"}</TableHead>
                  <TableHead className="w-20 text-center">{adminT(language, "common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendees.map((attendee, index) => (
                  <TableRow key={attendee.id} className="hover:bg-[hsl(var(--primary)/0.04)]">
                    <TableCell className="text-sm font-extrabold text-slate-400">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]"><Users className="h-4 w-4" /></div>
                        <div>
                          <p className="text-sm font-extrabold">{attendee.name}</p>
                          <p className="text-xs font-medium text-slate-400">{attendee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[230px]"><p className="line-clamp-2 text-sm font-bold text-slate-600">{attendee.event}</p></TableCell>
                    <TableCell><Badge className="gap-2 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]"><Ticket className="h-3.5 w-3.5" /> {attendee.ticket}</Badge></TableCell>
                    <TableCell><Badge className={statusClass(attendee.status)}>{adminStatusT(language, attendee.status)}</Badge></TableCell>
                    <TableCell><Badge className={certificateClass(attendee.certificate)}>{adminStatusT(language, attendee.certificate)}</Badge></TableCell>
                    <TableCell><TableDateTime value={attendee.registeredAt} /></TableCell>
                    <TableCell><TableDateTime value={attendee.checkedInAt} /></TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-slate-50"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-2xl border-0 p-2 shadow-xl">
                            <DropdownMenuLabel className="text-xs text-slate-400">{adminT(language, "common.actions")}</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 font-semibold">
                              <Link href={`/admin/attendees/${attendee.id}`}><Eye className="h-4 w-4" /> {adminT(language, "common.viewDetails")}</Link>
                            </DropdownMenuItem>
                            <ConfirmAction title="Check-in attendee?" description="This QR token will be checked in through the backend." confirmLabel="Check in" onConfirm={() => checkIn(attendee)}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-emerald-600"><UserCheck className="h-4 w-4" /> {adminT(language, "common.markCheckedIn")}</DropdownMenuItem>
                            </ConfirmAction>
                            <ConfirmAction title="Issue certificate?" description="Certificate will be issued only when attendee is checked in." confirmLabel="Issue certificate" tone="success" onConfirm={() => sendCertificate(attendee)}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-purple-600"><BadgeCheck className="h-4 w-4" /> {language === "ar" ? "إرسال الشهادة" : "Send certificate"}</DropdownMenuItem>
                            </ConfirmAction>
                            <DropdownMenuSeparator />
                            <ConfirmAction title="Cancel attendee?" description="This attendee QR token will be revoked." confirmLabel="Cancel attendee" tone="danger" onConfirm={() => cancel(attendee)}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-red-600"><XCircle className="h-4 w-4" /> {language === "ar" ? "إلغاء الحاضر" : "Cancel attendee"}</DropdownMenuItem>
                            </ConfirmAction>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAttendees.length === 0 && <div className="p-8 text-center text-sm font-semibold text-slate-400">{language === "ar" ? "لا يوجد حضور في قاعدة البيانات حالياً." : "No attendees in database yet."}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <Card className="rounded-[24px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
      <CardContent className="flex items-center gap-3 p-4">
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
