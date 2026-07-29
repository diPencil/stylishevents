"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  BadgeCheck,
  Download,
  Eye,
  FileText,
  IdCard,
  Mail,
  MoreHorizontal,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  UserCheck,
} from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ImageUrlDropzone } from "@/components/admin/image-url-dropzone"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { TableDateTime } from "@/components/admin/table-date-time"
import { useLanguage } from "@/contexts/language-context"
import { adminStatusT, adminT } from "@/lib/admin-translations"
import { platformApi } from "@/lib/platform-api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type DeliveryStatus = "sent" | "ready" | "not_ready"

type CertificateEvent = {
  id: string
  title: string
  date: string
  venue: string
  templateName: string
  cardName: string
  background: string
  issueRule: string
  footer: string
  signatory: string
}

type CustomerAsset = {
  id: string
  eventId: string
  attendee: string
  email: string
  ticket: string
  certificateNo: string
  cardNo: string
  certificateStatus: DeliveryStatus
  certificateSentAt: string
  cardStatus: DeliveryStatus
  cardSentAt: string
  checkedIn: boolean
}

function nowLabel() {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())
}

function deliveryClass(status: DeliveryStatus) {
  if (status === "sent") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (status === "ready") return "bg-blue-50 text-blue-700 hover:bg-blue-50"
  return "bg-amber-50 text-amber-700 hover:bg-amber-50"
}

function deliveryLabel(status: DeliveryStatus) {
  if (status === "sent") return "Sent"
  if (status === "ready") return "Ready"
  return "Waiting"
}

function normalizeDelivery(row: any): CustomerAsset {
  const eventId = String(row.event_id)
  return {
    id: String(row.attendee_id),
    eventId,
    attendee: row.full_name || "Customer",
    email: row.email || "",
    ticket: row.ticket_name_en || row.ticket_name_ar || "Ticket",
    certificateNo: row.certificate_number || `CERT-${row.attendee_number || row.attendee_id}`,
    cardNo: row.card_number || `CARD-${row.attendee_number || row.attendee_id}`,
    certificateStatus: row.certificate_status === "issued" ? "sent" : row.checked_in_at ? "ready" : "not_ready",
    certificateSentAt: row.certificate_sent_at || "",
    cardStatus: row.card_id ? "sent" : "ready",
    cardSentAt: row.card_sent_at || "",
    checkedIn: Boolean(row.checked_in_at),
  }
}

function normalizeDeliveryEvent(row: any): CertificateEvent {
  return {
    id: String(row.id),
    title: row.title_en || row.title_ar || "Event",
    date: row.starts_at || "",
    venue: row.venue_name_en || row.venue_city_en || "",
    templateName: "Certificate template",
    cardName: "Event card template",
    background: row.cover_image_url || "",
    issueRule: "Issue after check-in",
    footer: "Verified by Stylish Events.",
    signatory: row.organizer_name || "Stylish Events",
  }
}

export function CertificatesManager() {
  const { language } = useLanguage()
  const [assets, setAssets] = useState<CustomerAsset[]>([])
  const [events, setEvents] = useState<CertificateEvent[]>([])
  const [eventFilter, setEventFilter] = useState("all")
  const [activity, setActivity] = useState("Certificate and event-card delivery center is ready.")

  useEffect(() => {
    let active = true
    async function loadDelivery() {
      try {
        const [eventRows, deliveryRows] = await Promise.all([
          platformApi.listEvents(),
          platformApi.listCertificateDelivery(),
        ])
        if (!active) return
        setEvents((eventRows || []).map(normalizeDeliveryEvent))
        setAssets((deliveryRows || []).map(normalizeDelivery))
      } catch (error) {
        if (!active) return
        toast.error("Could not load certificates", { description: error instanceof Error ? error.message : "Check backend and MySQL." })
      }
    }
    loadDelivery()
    return () => {
      active = false
    }
  }, [])

  const visibleAssets = eventFilter === "all" ? assets : assets.filter((asset) => asset.eventId === eventFilter)

  const totals = useMemo(() => {
    return {
      customers: assets.length,
      certificatesSent: assets.filter((asset) => asset.certificateStatus === "sent").length,
      cardsSent: assets.filter((asset) => asset.cardStatus === "sent").length,
      waiting: assets.filter((asset) => asset.certificateStatus === "not_ready").length,
    }
  }, [assets])

  const updateAsset = (id: string, patch: Partial<CustomerAsset>, message: string) => {
    setAssets((current) => current.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)))
    setActivity(message)
  }

  const sendCertificate = async (asset: CustomerAsset) => {
    try {
      const issued = await platformApi.issueCertificate({ attendeeId: Number(asset.id), templateKey: "default" })
      updateAsset(
        asset.id,
        { checkedIn: true, certificateStatus: "sent", certificateNo: issued.certificateNumber || asset.certificateNo, certificateSentAt: new Date().toISOString() },
        `${issued.certificateNumber || asset.certificateNo} sent to ${asset.email}.`
      )
      toast.success("Certificate issued", { description: asset.attendee })
    } catch (error) {
      toast.error("Certificate issue failed", { description: error instanceof Error ? error.message : "Certificate can be issued after check-in." })
    }
  }

  const sendCard = async (asset: CustomerAsset) => {
    try {
      const card = await platformApi.generateEventCard({ attendeeId: Number(asset.id), templateKey: "default" })
      updateAsset(asset.id, { cardStatus: "sent", cardNo: card.cardNumber || asset.cardNo, cardSentAt: new Date().toISOString() }, `${card.cardNumber || asset.cardNo} sent to ${asset.email}.`)
      toast.success("Event card generated", { description: asset.attendee })
    } catch (error) {
      toast.error("Event card failed", { description: error instanceof Error ? error.message : "Could not generate event card." })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">
            {language === "ar" ? "عمليات الشهادات" : "Certificates Operations"}
          </Badge>
          <h1 className="text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">{adminT(language, "certificates.title")}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
            {language === "ar" ? "تابع كل شهادة وكارت فعالية تم إرسالهما للعملاء مع حالة التسليم والفعالية المرتبطة وإجراءات إعادة الإرسال." : "Track every certificate and event card sent to customers, with delivery status, event relation, and resend actions."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-10 rounded-2xl bg-white px-4 text-sm font-extrabold">
            <Link href="/admin/certificates/builder">
              <Sparkles className="h-4 w-4" />
              {adminT(language, "certificates.builder")}
            </Link>
          </Button>
          <Button className="h-10 rounded-2xl bg-[hsl(var(--primary))] px-4 text-sm font-extrabold text-white hover:bg-[hsl(var(--primary)/0.9)]">
            <Download className="h-4 w-4" />
            {language === "ar" ? "تصدير السجل" : "Export Log"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: language === "ar" ? "العملاء" : "Customers", value: totals.customers, icon: UserCheck },
          { label: language === "ar" ? "شهادات مرسلة" : "Certificates Sent", value: totals.certificatesSent, icon: BadgeCheck },
          { label: language === "ar" ? "كروت مرسلة" : "Event Cards Sent", value: totals.cardsSent, icon: IdCard },
          { label: language === "ar" ? "بانتظار الحضور" : "Waiting Check-in", value: totals.waiting, icon: FileText },
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

      <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base font-extrabold">{adminT(language, "certificates.table")}</CardTitle>
            <p className="mt-1 text-sm font-medium text-slate-400">
              {language === "ar" ? "كل صف عميل له حالة شهادة وكارت فعالية خاصة به." : "Each customer row has its own certificate and event card status."}
            </p>
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="h-10 rounded-xl md:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === "ar" ? "كل الفعاليات" : "All events"}</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1120px]">
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="w-14">#</TableHead>
                  <TableHead>{adminT(language, "common.customer")}</TableHead>
                  <TableHead>{adminT(language, "common.event")}</TableHead>
                    <TableHead>{adminT(language, "certificates.certificate")}</TableHead>
                    <TableHead>{language === "ar" ? "إرسال الشهادة" : "Certificate Sent"}</TableHead>
                  <TableHead>{adminT(language, "certificates.eventCard")}</TableHead>
                  <TableHead>{language === "ar" ? "إرسال الكارت" : "Card Sent"}</TableHead>
                  <TableHead>{language === "ar" ? "الحضور" : "Check-in"}</TableHead>
                  <TableHead className="w-20 text-center">{adminT(language, "common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleAssets.map((asset, index) => (
                  <TableRow key={asset.id} className="hover:bg-[hsl(var(--primary)/0.04)]">
                    <TableCell className="text-sm font-extrabold text-slate-400">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-extrabold text-[#17172f]">{asset.attendee}</p>
                        <p className="text-xs font-semibold text-slate-400">{asset.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[230px]">
                      <p className="line-clamp-2 text-sm font-bold text-slate-600">{events.find((event) => event.id === asset.eventId)?.title || "Event"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-xl", deliveryClass(asset.certificateStatus))}>
                        {adminStatusT(language, deliveryLabel(asset.certificateStatus))}
                      </Badge>
                    </TableCell>
                    <TableCell><TableDateTime value={asset.certificateSentAt} /></TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-xl", deliveryClass(asset.cardStatus))}>{adminStatusT(language, deliveryLabel(asset.cardStatus))}</Badge>
                    </TableCell>
                    <TableCell><TableDateTime value={asset.cardSentAt} /></TableCell>
                    <TableCell>
                      <Badge className={asset.checkedIn ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-slate-100 text-slate-500 hover:bg-slate-100"}>
                        {asset.checkedIn ? adminT(language, "status.checkedIn") : (language === "ar" ? "لم يحضر" : "Not checked")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-slate-50">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-0 p-2 shadow-xl">
                            <DropdownMenuLabel className="text-xs text-slate-400">{language === "ar" ? "ملفات العميل" : "Customer Assets"}</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 font-semibold">
                              <Link href={`/admin/certificates/${asset.id}`}>
                                <Eye className="h-4 w-4" />
                                {language === "ar" ? "معاينة الشهادة" : "Preview certificate"}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2 font-semibold">
                              <Link href={`/admin/certificates/cards/${asset.id}`}>
                                <IdCard className="h-4 w-4" />
                                Preview event card
                              </Link>
                            </DropdownMenuItem>
                            <ConfirmAction
                              title="Send certificate PDF?"
                              description="This customer's certificate will be marked as sent."
                              confirmLabel="Send PDF"
                              tone="success"
                              onConfirm={() => sendCertificate(asset)}
                            >
                              <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700">
                                <Send className="h-4 w-4" />
                                Send certificate
                              </DropdownMenuItem>
                            </ConfirmAction>
                            <ConfirmAction
                              title="Send event card?"
                              description="This customer's event card will be marked as sent."
                              confirmLabel="Send card"
                              tone="success"
                              onConfirm={() => sendCard(asset)}
                            >
                              <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-blue-600 focus:bg-blue-50 focus:text-blue-700">
                                <Mail className="h-4 w-4" />
                                Send event card
                              </DropdownMenuItem>
                            </ConfirmAction>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-slate-600"
                              onClick={() => sendCertificate(asset)}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Resend certificate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-slate-600"
                              onClick={() => sendCard(asset)}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Resend event card
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="text-base font-extrabold">{adminT(language, "certificates.sentCertificates")}</CardTitle>
            <p className="text-sm font-medium text-slate-400">{adminT(language, "certificates.sentCertificatesCopy")}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {assets.filter((asset) => asset.certificateStatus === "sent").map((asset) => (
              <div key={asset.certificateNo} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-extrabold">{asset.certificateNo}</p>
                  <p className="text-xs font-semibold text-slate-400">{asset.attendee} - {events.find((event) => event.id === asset.eventId)?.title || "Event"}</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{asset.certificateSentAt}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="text-base font-extrabold">{adminT(language, "certificates.sentCards")}</CardTitle>
            <p className="text-sm font-medium text-slate-400">{adminT(language, "certificates.sentCardsCopy")}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {assets.filter((asset) => asset.cardStatus === "sent").map((asset) => (
              <div key={asset.cardNo} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-extrabold">{asset.cardNo}</p>
                  <p className="text-xs font-semibold text-slate-400">{asset.attendee} - {asset.ticket}</p>
                </div>
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">{asset.cardSentAt}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[24px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
        <CardContent className="p-4 text-sm font-semibold text-slate-500">{activity}</CardContent>
      </Card>
    </div>
  )
}

export function CertificateBuilder() {
  const { language } = useLanguage()
  const [events, setEvents] = useState<CertificateEvent[]>([])
  const [assets, setAssets] = useState<CustomerAsset[]>([])
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedAssetId, setSelectedAssetId] = useState("")
  const [activity, setActivity] = useState("Certificate design workspace is ready.")

  useEffect(() => {
    let active = true
    async function loadBuilderData() {
      try {
        const [eventRows, deliveryRows, templateRows] = await Promise.all([
          platformApi.listEvents(),
          platformApi.listCertificateDelivery(),
          platformApi.listCertificateTemplates(),
        ])
        if (!active) return

        const normalizedEvents = (eventRows || []).map((row: any) => {
          const template = (templateRows || []).find((item: any) => Number(item.event_id) === Number(row.id))
          return {
            ...normalizeDeliveryEvent(row),
            templateName: template?.name || "Certificate template",
            background: template?.template_url || row.cover_image_url || "",
            issueRule: "Issue after check-in",
          }
        })
        const normalizedAssets = (deliveryRows || []).map(normalizeDelivery)
        setEvents(normalizedEvents)
        setAssets(normalizedAssets)
        setSelectedEventId((current) => current || normalizedEvents[0]?.id || "")
        setSelectedAssetId((current) => current || normalizedAssets[0]?.id || "")
      } catch (error) {
        if (!active) return
        toast.error("Could not load builder data", { description: error instanceof Error ? error.message : "Check backend and MySQL." })
      }
    }
    loadBuilderData()
    return () => {
      active = false
    }
  }, [])

  const selectedEvent = events.find((event) => event.id === selectedEventId) || events[0]
  const eventAssets = selectedEvent ? assets.filter((asset) => asset.eventId === selectedEvent.id) : []
  const selectedAsset =
    assets.find((asset) => asset.id === selectedAssetId && asset.eventId === selectedEvent?.id) || eventAssets[0] || assets[0]

  const updateEvent = (patch: Partial<CertificateEvent>) => {
    if (!selectedEvent) return
    setEvents((current) => current.map((event) => (event.id === selectedEvent.id ? { ...event, ...patch } : event)))
  }

  const saveTemplate = async () => {
    if (!selectedEvent?.id || !selectedEvent.templateName.trim() || !selectedEvent.background.trim()) {
      toast.error("Missing template data", { description: "Choose an event, template name, and artwork URL first." })
      return
    }

    try {
      await platformApi.createCertificateTemplate({
        eventId: Number(selectedEvent.id),
        name: selectedEvent.templateName,
        templateType: "image",
        templateUrl: selectedEvent.background,
        fieldPositions: {
          attendeeName: { x: "50%", y: "35%" },
          eventTitle: { x: "50%", y: "48%" },
          eventDate: { x: "18%", y: "78%" },
          certificateNumber: { x: "50%", y: "78%" },
          signatory: { x: "82%", y: "78%" },
        },
        isDefault: true,
        isActive: true,
      })
      setActivity(`${selectedEvent.templateName} saved to MySQL.`)
      toast.success("Template saved", { description: selectedEvent.title })
    } catch (error) {
      toast.error("Template save failed", { description: error instanceof Error ? error.message : "Could not save template." })
    }
  }

  if (!selectedEvent) {
    return (
      <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
        <CardContent className="p-8">
          <p className="text-base font-extrabold text-[#17172f]">{adminT(language, "certificates.noLiveEvents")}</p>
          <p className="mt-2 text-sm font-semibold text-slate-400">{adminT(language, "certificates.createEventFirst")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">
            Builder
          </Badge>
          <h1 className="text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">{adminT(language, "certificates.builder")}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
            Create one certificate design per event. Admin uploads the artwork, while customer data positions stay fixed.
          </p>
        </div>
        <Button asChild variant="outline" className="h-10 rounded-2xl bg-white px-4 text-sm font-extrabold">
          <Link href="/admin/certificates">{adminT(language, "certificates.backToDelivery")}</Link>
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-extrabold">
              <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
              Builder Settings
            </CardTitle>
            <p className="text-sm font-medium text-slate-400">{adminT(language, "certificates.templatePerEvent")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">{adminT(language, "common.event")}</Label>
              <Select
                value={selectedEventId}
                onValueChange={(value) => {
                  setSelectedEventId(value)
                  const firstAsset = assets.find((asset) => asset.eventId === value)
                  setSelectedAssetId(firstAsset?.id || "")
                }}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">{adminT(language, "certificates.templateName")}</Label>
              <Input value={selectedEvent.templateName} onChange={(event) => updateEvent({ templateName: event.target.value })} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold">{adminT(language, "certificates.cardTemplateName")}</Label>
              <Input value={selectedEvent.cardName} onChange={(event) => updateEvent({ cardName: event.target.value })} className="h-11 rounded-xl" />
            </div>
            <ImageUrlDropzone
              label="Certificate artwork URL"
              value={selectedEvent.background}
              onChange={(value) => {
                updateEvent({ background: value })
                setActivity(`Artwork updated for ${selectedEvent.title}. Dynamic fields kept their assigned positions.`)
              }}
              helperText="Paste the certificate image URL, or drag an image/link here. Data fields stay fixed."
            />
            <div className="space-y-2">
              <Label className="text-sm font-bold">{adminT(language, "certificates.issueRule")}</Label>
              <Input value={selectedEvent.issueRule} onChange={(event) => updateEvent({ issueRule: event.target.value })} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold">{adminT(language, "certificates.footerText")}</Label>
              <Textarea value={selectedEvent.footer} onChange={(event) => updateEvent({ footer: event.target.value })} className="min-h-24 rounded-xl" />
            </div>
            <Button className="h-11 w-full rounded-2xl bg-[hsl(var(--primary))] font-extrabold text-white hover:bg-[hsl(var(--primary)/0.9)]" onClick={saveTemplate}>
              <Save className="h-4 w-4" />
              Save Template
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
          <CardHeader className="flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-extrabold">{adminT(language, "certificates.certificatePreview")}</CardTitle>
              <p className="mt-1 text-sm font-medium text-slate-400">{adminT(language, "certificates.previewCopy")}</p>
            </div>
            <Select value={selectedAsset?.id || ""} onValueChange={setSelectedAssetId}>
              <SelectTrigger className="h-10 rounded-xl md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventAssets.length ? eventAssets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.attendee}
                  </SelectItem>
                )) : <SelectItem value="none" disabled>{adminT(language, "certificates.noCheckedCustomers")}</SelectItem>}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div
              className="relative mx-auto aspect-[1.414/1] w-full max-w-4xl overflow-hidden rounded-[24px] border border-slate-100 bg-gradient-to-br from-[#eef6ff] via-white to-[#f8effb] shadow-inner"
              style={
                selectedEvent.background
                  ? {
                      backgroundImage: `linear-gradient(rgba(255,255,255,.18), rgba(255,255,255,.18)), url(${selectedEvent.background})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="absolute left-[6%] top-[7%]">
                <img src="/logo.png" alt="Stylish Events" className="h-9 w-auto" />
              </div>
              <div className="absolute right-[6%] top-[8%] rounded-full bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[hsl(var(--primary))]">
                Verified Attendance
              </div>
              <div className="absolute inset-x-[9%] top-[25%] text-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-slate-400">{adminT(language, "certificates.certificateOfAttendance")}</p>
                <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-[#17172f] md:text-4xl">{selectedAsset?.attendee || "Customer name"}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                  has successfully attended <span className="font-extrabold text-[#17172f]">{selectedEvent.title}</span>
                </p>
              </div>
              <div className="absolute bottom-[17%] left-[9%] right-[9%] grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{adminT(language, "common.date")}</p>
                  <p className="text-xs font-extrabold text-[#17172f] md:text-sm">{selectedEvent.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{adminT(language, "certificates.certificateNo")}</p>
                  <p className="text-xs font-extrabold text-[#17172f] md:text-sm">{selectedAsset?.certificateNo || "Certificate number"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{adminT(language, "certificates.signedBy")}</p>
                  <p className="text-xs font-extrabold text-[#17172f] md:text-sm">{selectedEvent.signatory}</p>
                </div>
              </div>
              <p className="absolute bottom-[7%] left-[9%] right-[9%] text-center text-[10px] font-semibold text-slate-400 md:text-xs">{selectedEvent.footer}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">{activity}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
