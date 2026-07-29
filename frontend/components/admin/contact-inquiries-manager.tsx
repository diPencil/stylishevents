"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Eye, Inbox, Mail, MessageSquareText, Phone, RefreshCcw, Save, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { AdminPageHeader, MetricCard } from "@/components/admin/admin-primitives"
import { TableDateTime } from "@/components/admin/table-date-time"
import { useLanguage } from "@/contexts/language-context"
import { platformApi } from "@/lib/platform-api"

type ContactInquiryStatus = "new" | "in_progress" | "waiting_for_customer" | "resolved" | "closed"

type ContactInquiry = {
  id: number
  referenceCode: string
  fullName: string
  email: string
  phoneCountryCode: string
  phoneNumber: string
  company: string
  inquiryType: string
  subject: string
  message: string
  preferredContactMethod: string
  eventDate: string
  eventCity: string
  expectedAttendees: string | number
  status: ContactInquiryStatus
  adminNotes: string
  createdAt: string
  updatedAt: string
  resolvedAt: string
}

const statusOptions: Array<{ value: ContactInquiryStatus; labelEn: string; labelAr: string }> = [
  { value: "new", labelEn: "New", labelAr: "جديد" },
  { value: "in_progress", labelEn: "In Progress", labelAr: "قيد المتابعة" },
  { value: "waiting_for_customer", labelEn: "Waiting for Customer", labelAr: "بانتظار العميل" },
  { value: "resolved", labelEn: "Resolved", labelAr: "تم الحل" },
  { value: "closed", labelEn: "Closed", labelAr: "مغلق" },
]

const inquiryTypeOptions = [
  { value: "general", labelEn: "General Inquiry", labelAr: "استفسار عام" },
  { value: "event_planning", labelEn: "Event Planning", labelAr: "تنظيم فعالية" },
  { value: "technical_support", labelEn: "Technical Support", labelAr: "الدعم الفني" },
  { value: "partnership", labelEn: "Partnership", labelAr: "شراكة" },
  { value: "existing_booking", labelEn: "Existing Booking", labelAr: "حجز قائم" },
  { value: "other", labelEn: "Other", labelAr: "أخرى" },
]

function statusLabel(status: string, language: string) {
  const option = statusOptions.find((item) => item.value === status)
  return language === "ar" ? option?.labelAr || status : option?.labelEn || status
}

function typeLabel(type: string, language: string) {
  const option = inquiryTypeOptions.find((item) => item.value === type)
  return language === "ar" ? option?.labelAr || type : option?.labelEn || type.replaceAll("_", " ")
}

function statusClass(status: string) {
  if (status === "new") return "bg-blue-50 text-blue-700 hover:bg-blue-50"
  if (status === "in_progress") return "bg-amber-50 text-amber-700 hover:bg-amber-50"
  if (status === "waiting_for_customer") return "bg-violet-50 text-violet-700 hover:bg-violet-50"
  if (status === "resolved") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  return "bg-slate-100 text-slate-600 hover:bg-slate-100"
}

export function ContactInquiriesManager() {
  const { language, isRtl } = useLanguage()
  const [rows, setRows] = useState<ContactInquiry[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [type, setType] = useState("all")
  const [date, setDate] = useState("")
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactInquiry | null>(null)
  const [saving, setSaving] = useState(false)
  const limit = 10

  const queryParams = useMemo(() => ({
    search,
    status: status === "all" ? "" : status,
    type: type === "all" ? "" : type,
    date,
    limit,
    offset: page * limit,
  }), [search, status, type, date, page])

  useEffect(() => {
    let active = true
    setLoading(true)
    platformApi.listContactInquiries(queryParams)
      .then((payload) => {
        if (!active) return
        setRows(payload?.data || [])
        setSummary(payload?.summary || {})
        setTotal(Number(payload?.pagination?.total || 0))
      })
      .catch((error) => {
        if (active) toast.error(language === "ar" ? "تعذر تحميل الاستفسارات" : "Could not load inquiries", { description: error instanceof Error ? error.message : "" })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [queryParams, language])

  async function updateSelected() {
    if (!selected) return
    setSaving(true)
    try {
      const updated = await platformApi.updateContactInquiry(selected.id, {
        status: selected.status,
        adminNotes: selected.adminNotes,
      })
      setRows((current) => current.map((item) => item.id === updated.id ? updated : item))
      setSelected(updated)
      toast.success(language === "ar" ? "تم تحديث الاستفسار" : "Inquiry updated")
    } catch (error) {
      toast.error(language === "ar" ? "تعذر التحديث" : "Update failed", { description: error instanceof Error ? error.message : "" })
    } finally {
      setSaving(false)
    }
  }

  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow={language === "ar" ? "صندوق التواصل" : "Contact Inbox"}
        title={language === "ar" ? "استفسارات التواصل" : "Contact Inquiries"}
        description={language === "ar" ? "تابع استفسارات العملاء العامة والشراكات والدعم وتخطيط الفعاليات." : "Review general questions, partnerships, support requests, and event planning inquiries."}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label={language === "ar" ? "جديد" : "New"} value={summary.new || 0} icon={Inbox} />
        <MetricCard label={language === "ar" ? "قيد المتابعة" : "In Progress"} value={summary.in_progress || 0} icon={RefreshCcw} />
        <MetricCard label={language === "ar" ? "بانتظار العميل" : "Waiting"} value={summary.waiting_for_customer || 0} icon={MessageSquareText} />
        <MetricCard label={language === "ar" ? "تم الحل" : "Resolved"} value={summary.resolved || 0} icon={CalendarDays} />
      </div>

      <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
        <CardHeader className="gap-4 border-b border-slate-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-extrabold">{language === "ar" ? "جدول الاستفسارات" : "Inquiries Table"}</CardTitle>
              <p className="mt-1 text-sm font-medium text-slate-400">{language === "ar" ? "أحدث الاستفسارات أولا مع فلاتر عملية." : "Newest first with search and workflow filters."}</p>
            </div>
            <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_170px_180px_150px]">
              <div className="relative">
                <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ltr:left-3 rtl:right-3" />
                <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder={language === "ar" ? "بحث..." : "Search..."} className="h-11 rounded-2xl bg-slate-50 ltr:pl-9 rtl:pr-9" />
              </div>
              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(0) }}>
                <SelectTrigger className="h-11 rounded-2xl bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "كل الحالات" : "All status"}</SelectItem>
                  {statusOptions.map((item) => <SelectItem key={item.value} value={item.value}>{language === "ar" ? item.labelAr : item.labelEn}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={(value) => { setType(value); setPage(0) }}>
                <SelectTrigger className="h-11 rounded-2xl bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "كل الأنواع" : "All types"}</SelectItem>
                  {inquiryTypeOptions.map((item) => <SelectItem key={item.value} value={item.value}>{language === "ar" ? item.labelAr : item.labelEn}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(0) }} className="h-11 rounded-2xl bg-slate-50" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1080px]">
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead>{language === "ar" ? "المرجع" : "Reference"}</TableHead>
                  <TableHead>{language === "ar" ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{language === "ar" ? "النوع" : "Inquiry type"}</TableHead>
                  <TableHead>{language === "ar" ? "الموضوع" : "Subject"}</TableHead>
                  <TableHead>{language === "ar" ? "التواصل" : "Email / phone"}</TableHead>
                  <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{language === "ar" ? "تاريخ الإنشاء" : "Created"}</TableHead>
                  <TableHead className="w-24 text-center">{language === "ar" ? "إجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-[hsl(var(--primary)/0.04)]">
                    <TableCell className="font-black text-[hsl(var(--primary))]" dir="ltr">{row.referenceCode}</TableCell>
                    <TableCell>
                      <p className="text-sm font-extrabold text-[#17172f]">{row.fullName}</p>
                      <p className="text-xs font-bold text-slate-400">{row.company || "-"}</p>
                    </TableCell>
                    <TableCell><Badge className="rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-100">{typeLabel(row.inquiryType, language)}</Badge></TableCell>
                    <TableCell className="max-w-[260px]"><p className="line-clamp-2 text-sm font-bold text-slate-600">{row.subject}</p></TableCell>
                    <TableCell>
                      <p className="flex items-center gap-2 text-xs font-bold text-slate-600"><Mail className="h-3.5 w-3.5" /> {row.email}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-400" dir="ltr"><Phone className="h-3.5 w-3.5" /> {`${row.phoneCountryCode || ""} ${row.phoneNumber || ""}`.trim() || "-"}</p>
                    </TableCell>
                    <TableCell><Badge className={statusClass(row.status)}>{statusLabel(row.status, language)}</Badge></TableCell>
                    <TableCell><TableDateTime value={row.createdAt} /></TableCell>
                    <TableCell className="text-center">
                      <Button size="icon" variant="ghost" onClick={() => setSelected(row)} className="h-9 w-9 rounded-xl bg-slate-50"><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!rows.length ? (
              <div className="p-8 text-center text-sm font-semibold text-slate-400">
                {loading ? (language === "ar" ? "جاري التحميل..." : "Loading...") : language === "ar" ? "لا توجد استفسارات." : "No contact inquiries found."}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold text-slate-400">{language === "ar" ? `صفحة ${page + 1} من ${pages}` : `Page ${page + 1} of ${pages}`}</p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} className="h-10 rounded-xl font-bold">{language === "ar" ? "السابق" : "Previous"}</Button>
              <Button variant="outline" disabled={page + 1 >= pages} onClick={() => setPage((current) => current + 1)} className="h-10 rounded-xl font-bold">{language === "ar" ? "التالي" : "Next"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-[28px] border-0 p-6" dir={isRtl ? "rtl" : "ltr"}>
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">{selected.referenceCode}</DialogTitle>
                <DialogDescription>{selected.subject}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <Detail label={language === "ar" ? "الاسم" : "Full name"} value={selected.fullName} />
                <Detail label={language === "ar" ? "البريد" : "Email"} value={selected.email} dir="ltr" />
                <Detail label={language === "ar" ? "الهاتف" : "Phone"} value={`${selected.phoneCountryCode || ""} ${selected.phoneNumber || ""}`.trim() || "-"} dir="ltr" />
                <Detail label={language === "ar" ? "الشركة" : "Company"} value={selected.company || "-"} />
                <Detail label={language === "ar" ? "النوع" : "Inquiry type"} value={typeLabel(selected.inquiryType, language)} />
                <Detail label={language === "ar" ? "وسيلة التواصل" : "Preferred contact"} value={selected.preferredContactMethod} />
                {selected.inquiryType === "event_planning" ? (
                  <>
                    <Detail label={language === "ar" ? "تاريخ الفعالية" : "Event date"} value={selected.eventDate || "-"} />
                    <Detail label={language === "ar" ? "المدينة" : "City"} value={selected.eventCity || "-"} />
                    <Detail label={language === "ar" ? "الحضور المتوقع" : "Expected attendees"} value={String(selected.expectedAttendees || "-")} />
                  </>
                ) : null}
                <div className="md:col-span-2">
                  <Detail label={language === "ar" ? "الرسالة" : "Message"} value={selected.message} multiline />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-extrabold">{language === "ar" ? "الحالة" : "Status"}</Label>
                  <Select value={selected.status} onValueChange={(value) => setSelected({ ...selected, status: value as ContactInquiryStatus })}>
                    <SelectTrigger className="h-11 rounded-2xl bg-slate-50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((item) => <SelectItem key={item.value} value={item.value}>{language === "ar" ? item.labelAr : item.labelEn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-extrabold">{language === "ar" ? "ملاحظات داخلية" : "Internal admin notes"}</Label>
                  <Textarea value={selected.adminNotes || ""} onChange={(event) => setSelected({ ...selected, adminNotes: event.target.value })} className="min-h-[130px] rounded-2xl bg-slate-50" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button disabled={saving} onClick={updateSelected} className="h-11 rounded-2xl px-6 font-extrabold">
                  <Save className="h-4 w-4" />
                  {saving ? (language === "ar" ? "جاري الحفظ..." : "Saving...") : language === "ar" ? "حفظ التحديث" : "Save Update"}
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Detail({ label, value, multiline, dir }: { label: string; value: string; multiline?: boolean; dir?: "ltr" | "rtl" }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-bold leading-6 text-[#17172f] ${multiline ? "whitespace-pre-wrap" : "break-words"}`} dir={dir}>{value || "-"}</p>
    </div>
  )
}
