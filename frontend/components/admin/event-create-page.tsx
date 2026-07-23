"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarDays, CheckCircle2, FileText, ImageIcon, MapPin, Search, Settings2, Ticket, UploadCloud } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { ImageGalleryDropzone, ImageUrlDropzone } from "@/components/admin/image-url-dropzone"
import { platformApi } from "@/lib/platform-api"
import { enabledCurrencyRates, formatCurrencyAmount, readCurrencySettings, type CurrencyRate, type CurrencySettings } from "@/lib/currency-settings"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"

type CreateEventForm = {
  titleAr: string
  titleEn: string
  slug: string
  status: "draft" | "published" | "completed" | "disabled"
  type: string
  category: string
  organizer: string
  city: string
  venue: string
  location: string
  capacity: string
  startsAt: string
  endsAt: string
  registrationOpensAt: string
  registrationClosesAt: string
  summaryAr: string
  summaryEn: string
  agenda: string
  checkInNotes: string
  terms: string
  heroImage: string
  galleryImages: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  ticketNameAr: string
  ticketNameEn: string
  ticketCode: string
  ticketQuota: string
  maxPerOrder: string
  ticketCurrency: string
  openingPrice: string
  openingStartsAt: string
  openingEndsAt: string
}

const initialForm: CreateEventForm = {
  titleAr: "",
  titleEn: "",
  slug: "",
  status: "draft",
  type: "Conference",
  category: "",
  organizer: "",
  city: "",
  venue: "",
  location: "",
  capacity: "",
  startsAt: "",
  endsAt: "",
  registrationOpensAt: "",
  registrationClosesAt: "",
  summaryAr: "",
  summaryEn: "",
  agenda: "",
  checkInNotes: "",
  terms: "",
  heroImage: "",
  galleryImages: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ticketNameAr: "",
  ticketNameEn: "",
  ticketCode: "",
  ticketQuota: "",
  maxPerOrder: "4",
  ticketCurrency: "USD",
  openingPrice: "",
  openingStartsAt: "",
  openingEndsAt: "",
}

export function EventCreatePage() {
  const { language } = useLanguage()
  const [form, setForm] = useState(initialForm)
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle")
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(() => readCurrencySettings())

  const currencies = useMemo(() => enabledCurrencyRates(currencySettings), [currencySettings])
  const gallery = useMemo(() => form.galleryImages.split("\n").map((item) => item.trim()).filter(Boolean), [form.galleryImages])
  const openingPricePreview = formatCurrencyAmount(Number(form.openingPrice) || 0, form.ticketCurrency, currencySettings)

  useEffect(() => {
    const syncCurrencySettings = () => setCurrencySettings(readCurrencySettings())
    window.addEventListener("stylish-events-currency-settings-updated", syncCurrencySettings)
    window.addEventListener("storage", syncCurrencySettings)
    return () => {
      window.removeEventListener("stylish-events-currency-settings-updated", syncCurrencySettings)
      window.removeEventListener("storage", syncCurrencySettings)
    }
  }, [])

  const setField = <K extends keyof CreateEventForm>(key: K, value: CreateEventForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setSaveState("idle")
  }

  const pricePair = useMemo(() => {
    const amount = Number(form.openingPrice || 0)
    const selectedRate = currencySettings.rates.find((rate) => rate.code === form.ticketCurrency)?.rate || 1
    const egpRate = currencySettings.rates.find((rate) => rate.code === "EGP")?.rate || 1
    const usdAmount = form.ticketCurrency === "USD" ? amount : amount / selectedRate
    return {
      priceUsd: Number(usdAmount.toFixed(2)),
      priceEgp: Number((usdAmount * egpRate).toFixed(2)),
    }
  }, [currencySettings.rates, form.openingPrice, form.ticketCurrency])

  const saveDraft = async () => {
    if (!form.titleEn.trim() || !form.titleAr.trim() || !form.slug.trim() || !form.startsAt || !form.endsAt) {
      toast.error(language === "ar" ? "بيانات الفعالية غير مكتملة" : "Missing event data", { description: language === "ar" ? "العنوان العربي والإنجليزي والرابط وتاريخ البداية والنهاية مطلوبة." : "Arabic title, English title, slug, start date, and end date are required." })
      return
    }

    try {
      const event = await platformApi.createEvent({
        slug: form.slug.trim(),
        titleAr: form.titleAr.trim(),
        titleEn: form.titleEn.trim(),
        summaryAr: form.summaryAr || null,
        summaryEn: form.summaryEn || null,
        descriptionAr: [form.summaryAr, form.agenda, form.checkInNotes, form.terms].filter(Boolean).join("\n\n") || null,
        descriptionEn: [form.summaryEn, form.agenda, form.checkInNotes, form.terms].filter(Boolean).join("\n\n") || null,
        type: form.type.toLowerCase(),
        status: form.status,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        registrationStartsAt: form.registrationOpensAt || null,
        registrationEndsAt: form.registrationClosesAt || null,
        timezone: "Africa/Cairo",
        maxAttendees: Number(form.capacity || 0) || null,
        coverImageUrl: form.heroImage || null,
        bannerImageUrl: form.heroImage || null,
        gallery: gallery,
        googleMapsUrl: form.location || null,
        venueId: null,
        organizerId: null,
      })

      if (form.ticketNameEn.trim() && form.ticketNameAr.trim() && Number(form.ticketQuota || 0) > 0) {
        const ticket = await platformApi.createTicket({
          eventId: event.id,
          nameEn: form.ticketNameEn.trim(),
          nameAr: form.ticketNameAr.trim(),
          descriptionEn: form.ticketCode || null,
          descriptionAr: form.ticketCode || null,
          quota: Number(form.ticketQuota),
          perOrderLimit: Number(form.maxPerOrder || 1),
          isActive: true,
        })

        if (form.openingStartsAt && form.openingEndsAt && Number(form.openingPrice || 0) >= 0) {
          await platformApi.createPricePeriod({
            ticketTypeId: ticket.id,
            labelEn: "Opening price",
            labelAr: "سعر الافتتاح",
            price: Number(form.openingPrice || 0),
            priceEgp: pricePair.priceEgp,
            priceUsd: pricePair.priceUsd,
            startsAt: form.openingStartsAt,
            endsAt: form.openingEndsAt,
            isActive: true,
          })
        }
      }

      setSaveState("saved")
      toast.success(language === "ar" ? "تم إنشاء الفعالية" : "Event created", { description: language === "ar" ? "تم حفظ الفعالية والتذكرة وسعر الافتتاح في MySQL." : "Event, ticket, and opening price were saved to MySQL." })
    } catch (error) {
      toast.error(language === "ar" ? "فشل إنشاء الفعالية" : "Create event failed", { description: error instanceof Error ? error.message : (language === "ar" ? "راجع اتصال الباك إند و MySQL." : "Please check backend and MySQL.") })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge className="mb-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">{adminT(language, "createEvent.badge")}</Badge>
          <h1 className="text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">{adminT(language, "createEvent.title")}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
            {adminT(language, "createEvent.subtitle")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="h-10 rounded-2xl bg-white font-extrabold">
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
              {language === "ar" ? "رجوع للفعاليات" : "Back to events"}
            </Link>
          </Button>
          <ConfirmAction title={language === "ar" ? "حفظ مسودة الفعالية؟" : "Save event draft?"} description={language === "ar" ? "سيتم حفظ إعدادات الفعالية والصور والسيو والتذكرة وفترة السعر كمسودة." : "The event setup, media, SEO, ticket, and opening price period will be saved as a draft."} confirmLabel={language === "ar" ? "حفظ المسودة" : "Save draft"} onConfirm={saveDraft}>
            <Button className="h-10 rounded-2xl px-5 font-extrabold">
              <CheckCircle2 className="h-4 w-4" />
              {saveState === "saved" ? (language === "ar" ? "تم حفظ المسودة" : "Draft Saved") : adminT(language, "common.save")}
            </Button>
          </ConfirmAction>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <FormPanel icon={FileText} title="Event Identity" description="Arabic and English naming, slug, organizer, type, and publish state.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Arabic title" value={form.titleAr} onChange={(value) => setField("titleAr", value)} />
              <Field label="English title" value={form.titleEn} onChange={(value) => setField("titleEn", value)} />
              <Field label="Slug" value={form.slug} onChange={(value) => setField("slug", value)} />
              
              <div className="space-y-2">
                <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">Display Page</Label>
                <Select value={form.status} onValueChange={(value) => setField("status", value as any)}>
                  <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    <SelectItem value="published">Upcoming Events</SelectItem>
                    <SelectItem value="completed">Previous Events</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <SelectField label="Type" value={form.type} onChange={(value) => setField("type", value)} options={["Conference", "Exhibition", "Forum", "Workshop", "Festival"]} />
              <Field label="Category" value={form.category} onChange={(value) => setField("category", value)} />
              <Field label="Organizer" value={form.organizer} onChange={(value) => setField("organizer", value)} className="md:col-span-2" />
            </div>
          </FormPanel>

          <FormPanel icon={MapPin} title="Venue & Capacity" description="Location details and maximum available seats for the event.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="City" value={form.city} onChange={(value) => setField("city", value)} />
              <Field label="Venue" value={form.venue} onChange={(value) => setField("venue", value)} />
              <Field label="Full location" value={form.location} onChange={(value) => setField("location", value)} className="md:col-span-2" />
              <Field label="Available seats" value={form.capacity} onChange={(value) => setField("capacity", value)} type="number" />
            </div>
          </FormPanel>

          <FormPanel icon={CalendarDays} title="Dates & Registration" description="Separate event schedule from registration availability.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Event starts" value={form.startsAt} onChange={(value) => setField("startsAt", value)} type="datetime-local" />
              <Field label="Event ends" value={form.endsAt} onChange={(value) => setField("endsAt", value)} type="datetime-local" />
              <Field label="Registration opens" value={form.registrationOpensAt} onChange={(value) => setField("registrationOpensAt", value)} type="datetime-local" />
              <Field label="Registration closes" value={form.registrationClosesAt} onChange={(value) => setField("registrationClosesAt", value)} type="datetime-local" />
            </div>
          </FormPanel>

          <FormPanel icon={ImageIcon} title="Event Media" description="Hero image and gallery images shown on the public event page.">
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
              <div className="space-y-4">
                <ImageUrlDropzone label="Event image URL" value={form.heroImage} onChange={(value) => setField("heroImage", value)} />
                <ImageGalleryDropzone label="Gallery images" value={form.galleryImages} onChange={(value) => setField("galleryImages", value)} />
              </div>
              <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
                  {form.heroImage ? <img src={form.heroImage} alt="Event hero preview" className="h-full w-full object-cover" /> : <MediaEmpty />}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {gallery.slice(0, 6).map((image) => (
                    <div key={image} className="aspect-square overflow-hidden rounded-xl bg-white">
                      <img src={image} alt="Event gallery preview" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FormPanel>

          <FormPanel icon={Settings2} title="Content & Operations" description="Public descriptions plus internal notes for support, check-in, and attendee rules.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextAreaField label="Arabic summary" value={form.summaryAr} onChange={(value) => setField("summaryAr", value)} />
              <TextAreaField label="English summary" value={form.summaryEn} onChange={(value) => setField("summaryEn", value)} />
              <TextAreaField label="Agenda" value={form.agenda} onChange={(value) => setField("agenda", value)} />
              <TextAreaField label="Check-in notes" value={form.checkInNotes} onChange={(value) => setField("checkInNotes", value)} />
              <TextAreaField label="Ticket terms" value={form.terms} onChange={(value) => setField("terms", value)} />
            </div>
          </FormPanel>

          <FormPanel icon={Search} title="SEO" description="Metadata used by the public event page and social previews.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="SEO title" value={form.seoTitle} onChange={(value) => setField("seoTitle", value)} />
              <Field label="Keywords" value={form.seoKeywords} onChange={(value) => setField("seoKeywords", value)} />
              <TextAreaField label="SEO description" value={form.seoDescription} onChange={(value) => setField("seoDescription", value)} />
            </div>
          </FormPanel>

          <FormPanel icon={Ticket} title="First Ticket & Opening Price" description="Create the first ticket type with a dated opening pricing period.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Arabic ticket name" value={form.ticketNameAr} onChange={(value) => setField("ticketNameAr", value)} />
              <Field label="English ticket name" value={form.ticketNameEn} onChange={(value) => setField("ticketNameEn", value)} />
              <Field label="Ticket code" value={form.ticketCode} onChange={(value) => setField("ticketCode", value)} />
              <CurrencySelect value={form.ticketCurrency} currencies={currencies} onChange={(value) => setField("ticketCurrency", value)} />
              <Field label="Quota" value={form.ticketQuota} onChange={(value) => setField("ticketQuota", value)} type="number" />
              <Field label="Max per order" value={form.maxPerOrder} onChange={(value) => setField("maxPerOrder", value)} type="number" />
              <Field label="Opening price" value={form.openingPrice} onChange={(value) => setField("openingPrice", value)} type="number" />
              <Field label="Price starts" value={form.openingStartsAt} onChange={(value) => setField("openingStartsAt", value)} type="datetime-local" />
              <Field label="Price ends" value={form.openingEndsAt} onChange={(value) => setField("openingEndsAt", value)} type="datetime-local" />
            </div>
          </FormPanel>
        </div>

        <aside className="space-y-5">
          <Card className="sticky top-4 rounded-[28px] border-0 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
            <CardHeader>
              <CardTitle className="text-base font-extrabold text-[#17172f]">{adminT(language, "createEvent.eventPreview")}</CardTitle>
              <p className="text-sm font-medium text-slate-400">{adminT(language, "createEvent.previewCopy")}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-[24px] bg-slate-950">
                <div className="aspect-[4/3] bg-slate-200">
                  {form.heroImage ? <img src={form.heroImage} alt="Event preview" className="h-full w-full object-cover" /> : <MediaEmpty />}
                </div>
                <div className="p-4 text-white">
                  <Badge className="mb-3 rounded-xl bg-white/15 text-white hover:bg-white/15">{form.type}</Badge>
                  <h2 className="text-lg font-extrabold">{form.titleEn || "Event title"}</h2>
                  <p className="mt-2 text-sm font-medium text-white/70">{form.venue}</p>
                </div>
              </div>
              <SummaryItem label="Display Page" value={form.status === "published" ? "Upcoming Events" : form.status === "completed" ? "Previous Events" : form.status === "draft" ? "Draft (Hidden)" : "Disabled"} />
              <SummaryItem label="Seats" value={Number(form.capacity || 0).toLocaleString()} />
              <SummaryItem label="Ticket" value={form.ticketNameEn || "Ticket"} />
              <SummaryItem label="Opening price" value={openingPricePreview} />
              <ConfirmAction title="Save event draft?" description="This will save the current event setup as a draft workflow." confirmLabel="Save draft" onConfirm={saveDraft}>
                <Button className="h-11 w-full rounded-2xl font-extrabold">
                  <CheckCircle2 className="h-4 w-4" />
                  {saveState === "saved" ? "Draft Saved" : "Save Event"}
                </Button>
              </ConfirmAction>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function FormPanel({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.055)]">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-base font-extrabold text-[#17172f]">{title}</CardTitle>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{description}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function Field({ label, value, onChange, type = "text", className }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold" />
    </div>
  )
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[112px] rounded-2xl border-slate-200 bg-slate-50 font-semibold leading-6" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function CurrencySelect({ value, onChange, currencies }: { value: string; onChange: (value: string) => void; currencies: CurrencyRate[] }) {
  const { language } = useLanguage()
  return (
    <div className="space-y-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{adminT(language, "common.currency")}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <span className="text-sm font-extrabold text-[#17172f]">{value}</span>
    </div>
  )
}

function MediaEmpty() {
  const { language } = useLanguage()
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
      <UploadCloud className="h-8 w-8" />
      <span className="text-xs font-extrabold">{adminT(language, "common.imagePreview")}</span>
    </div>
  )
}

