"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, Clock3, QrCode, ScanLine, Ticket, UserCheck, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"
import { platformApi } from "@/lib/platform-api"

type ScanResult = {
  status: "idle" | "accepted" | "duplicate" | "invalid" | "revoked"
  message: string
  attendee?: any
  scannedAt?: string
}

function formatTime(value?: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(value))
}

function resultClasses(status: ScanResult["status"]) {
  if (status === "accepted") return "bg-emerald-50 text-emerald-800"
  if (status === "duplicate") return "bg-amber-50 text-amber-800"
  if (status === "revoked" || status === "invalid") return "bg-red-50 text-red-800"
  return "bg-slate-50 text-slate-700"
}

export function CheckinConsole() {
  const { language } = useLanguage()
  const [qrToken, setQrToken] = useState("")
  const [attendees, setAttendees] = useState<any[]>([])
  const [result, setResult] = useState<ScanResult>({ status: "idle", message: "" })
  const [logs, setLogs] = useState<ScanResult[]>([])

  async function loadAttendees() {
    const rows = await platformApi.listAttendees()
    setAttendees(rows || [])
  }

  useEffect(() => {
    loadAttendees().catch((error) => {
      toast.error("Could not load attendees", { description: error instanceof Error ? error.message : "Check the backend connection." })
    })
  }, [])

  const totals = useMemo(() => {
    const checkedIn = attendees.filter((item) => item.checked_in_at || item.qr_status === "used").length
    const cancelled = attendees.filter((item) => item.qr_status === "revoked").length
    return {
      total: attendees.length,
      checkedIn,
      waiting: Math.max(attendees.length - checkedIn - cancelled, 0),
      cancelled,
    }
  }, [attendees])

  const scan = async () => {
    const token = qrToken.trim()
    const scannedAt = new Date().toISOString()

    if (!token) {
      setResult({ status: "invalid", message: "Enter QR token first", scannedAt })
      return
    }

    try {
      const attendee = await platformApi.checkin(token)
      const accepted = { status: "accepted" as const, message: "Check-in accepted", attendee, scannedAt }
      setResult(accepted)
      setLogs((current) => [accepted, ...current].slice(0, 8))
      setQrToken("")
      await loadAttendees()
      toast.success("Check-in accepted", { description: attendee.full_name || attendee.attendee_number })
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Invalid QR token"
      const status = message.toLowerCase().includes("already") ? "duplicate" : message.toLowerCase().includes("active") ? "revoked" : "invalid"
      const failed = { status: status as ScanResult["status"], message, scannedAt }
      setResult(failed)
      setLogs((current) => [failed, ...current].slice(0, 8))
      setQrToken("")
      toast.error("Check-in failed", { description: message })
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Badge className="mb-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">{language === "ar" ? "تسجيل حضور QR" : "QR Check-in"}</Badge>
        <h1 className="text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">{adminT(language, "checkin.title")}</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
          {language === "ar" ? "تحقق من تذاكر QR مباشرة من قاعدة البيانات وامنع الدخول المكرر أو الملغي." : "Validate live attendee QR tickets from the database and prevent duplicate or revoked access."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: language === "ar" ? "إجمالي التذاكر" : "Total Tickets", value: totals.total, icon: Ticket },
          { label: adminT(language, "overview.checkedIn"), value: totals.checkedIn, icon: UserCheck },
          { label: adminT(language, "status.waiting"), value: totals.waiting, icon: Clock3 },
          { label: language === "ar" ? "ملغي" : "Revoked", value: totals.cancelled, icon: XCircle },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="rounded-[24px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{item.label}</p>
                  <p className="text-lg font-extrabold text-[#17172f]">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-extrabold">
              <ScanLine className="h-5 w-5 text-[hsl(var(--primary))]" />
              {adminT(language, "checkin.scanOrEnter")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex min-h-[230px] items-center justify-center rounded-[26px] border border-dashed border-[hsl(var(--primary)/0.25)] bg-slate-50">
              <div className="text-center">
                <QrCode className="mx-auto h-20 w-20 text-[#17172f]" />
                <p className="mt-4 text-sm font-bold text-slate-500">{language === "ar" ? "منطقة فحص QR الخاصة بالحضور" : "Scan area for attendee QR validation"}</p>
                <p className="mt-2 text-xs font-semibold text-slate-400">{language === "ar" ? "يمكن للموظف إدخال الرمز يدوياً للتحقق." : "Manual token entry is available for staff verification."}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label className="text-sm font-bold">{adminT(language, "checkin.token")}</Label>
                <Input value={qrToken} onChange={(event) => setQrToken(event.target.value)} className="h-11 rounded-xl" placeholder={language === "ar" ? "الصق رمز QR" : "Paste QR token"} />
              </div>
              <ConfirmAction title="Confirm Check-in" description="The QR token will be validated against the live attendee database." confirmLabel="Check in" onConfirm={scan} tone="success">
                <Button className="h-11 self-end rounded-xl bg-[hsl(var(--primary))] px-8 font-extrabold text-white">{adminT(language, "checkin.checkIn")}</Button>
              </ConfirmAction>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="text-base font-extrabold">{adminT(language, "checkin.scanResult")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`rounded-[26px] p-5 ${resultClasses(result.status)}`}>
              {result.status === "accepted" ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
              <p className="mt-4 text-lg font-extrabold">{result.message || adminT(language, "checkin.waiting")}</p>
              {result.attendee && (
                <div className="mt-4 space-y-2 text-sm font-semibold">
                  <p>{result.attendee.full_name || result.attendee.attendee_number}</p>
                  <p className="opacity-80">{result.attendee.email}</p>
                </div>
              )}
            </div>
            <div className="mt-5 space-y-2">
              {logs.map((log, index) => (
                <div key={`${log.status}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 text-sm">
                  <div>
                    <p className="font-extrabold">{log.attendee?.full_name || log.message}</p>
                    <p className="text-xs font-medium text-slate-400">{formatTime(log.scannedAt)}</p>
                  </div>
                  <Badge variant={log.status === "accepted" ? "default" : "secondary"} className="capitalize">{log.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
