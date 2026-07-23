"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  MapPin,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Plus,
  RotateCcw,
  Search,
  Star,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { TableDateTime } from "@/components/admin/table-date-time"
import { useLanguage } from "@/contexts/language-context"
import { adminStatusT, adminT } from "@/lib/admin-translations"
import { enabledCurrencyRates, formatCurrencyAmount, readCurrencySettings, type CurrencyRate, type CurrencySettings } from "@/lib/currency-settings"
import { platformApi } from "@/lib/platform-api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type EventStatus = "published" | "draft" | "disabled" | "deleted" | "completed"
type PeriodStatus = "scheduled" | "active" | "ended"

type AdminEvent = {
  id: number
  slug: string
  title_en: string
  title_ar: string
  location: string
  city: string
  venue: string
  rating: number
  type: string
  category: string
  status: EventStatus
  starts_at: string
  ends_at: string
  registration_opens_at: string
  registration_closes_at: string
  max_attendees: number
  ticket_types_count: number
  attendees_count: number
  review_count: number
  revenue: string
  hero_image: string
  organizer: string
}

type TicketType = {
  id: number
  event_id: number
  name_en: string
  name_ar: string
  code: string
  quota: number
  sold_count: number
  max_per_order: number
  visibility: "public" | "private" | "hidden"
  benefits: string[]
  description: string
}

type PricePeriod = {
  id: number
  event_id: number
  ticket_id: number
  label: string
  starts_at: string
  ends_at: string
  price: number
  currency: string
  status: PeriodStatus
}

type TicketForm = {
  eventId: string
  nameAr: string
  nameEn: string
  code: string
  quota: string
  maxPerOrder: string
  visibility: TicketType["visibility"]
  description: string
  benefits: string
  periods: Array<{ label: string; startsAt: string; endsAt: string; price: string; currency: string }>
}

const emptyTicketForm: TicketForm = {
  eventId: "",
  nameAr: "",
  nameEn: "",
  code: "",
  quota: "",
  maxPerOrder: "",
  visibility: "public",
  description: "",
  benefits: "",
  periods: [
    { label: "", startsAt: "", endsAt: "", price: "", currency: "USD" },
  ],
}

function statusBadge(status: EventStatus) {
  if (status === "published") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (status === "completed") return "bg-blue-50 text-blue-700 hover:bg-blue-50"
  if (status === "disabled") return "bg-red-50 text-red-700 hover:bg-red-50"
  return "bg-slate-100 text-slate-700 hover:bg-slate-100"
}

function periodBadge(status: PeriodStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  if (status === "ended") return "bg-slate-100 text-slate-500 hover:bg-slate-100"
  return "bg-blue-50 text-blue-700 hover:bg-blue-50"
}

function money(value: number, currency: string, settings: CurrencySettings) {
  return formatCurrencyAmount(value, currency, settings)
}

function ticketPriceRange(ticket: TicketType, periods: PricePeriod[], settings: CurrencySettings) {
  const ticketPeriods = periods.filter((period) => period.ticket_id === ticket.id)
  const prices = ticketPeriods.map((period) => period.price)
  if (!prices.length) return "No pricing"
  const currency = ticketPeriods[0]?.currency || settings.baseCurrency
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? money(min, currency, settings) : `${money(min, currency, settings)} - ${money(max, currency, settings)}`
}

function periodStatus(startsAt: string, endsAt: string): PeriodStatus {
  const now = Date.now()
  const start = new Date(startsAt).getTime()
  const end = new Date(endsAt).getTime()
  if (Number.isFinite(end) && end < now) return "ended"
  if (Number.isFinite(start) && start > now) return "scheduled"
  return "active"
}

function normalizeEvent(row: any): AdminEvent {
  return {
    id: Number(row.id),
    slug: row.slug || String(row.id),
    title_en: row.title_en || row.titleEn || "Untitled event",
    title_ar: row.title_ar || row.titleAr || row.title_en || row.titleEn || "Untitled event",
    location: row.venue_name_en || row.venue_city_en || row.google_maps_url || "Venue not set",
    city: row.venue_city_en || "",
    venue: row.venue_name_en || "",
    rating: Number(row.average_rating || 0),
    type: row.type || "conference",
    category: row.type || "event",
    status: row.status === "deleted" ? "deleted" : row.status === "disabled" ? "disabled" : row.status === "published" ? "published" : row.status === "completed" ? "completed" : "draft",
    starts_at: row.starts_at || row.startsAt || "",
    ends_at: row.ends_at || row.endsAt || "",
    registration_opens_at: row.registration_starts_at || row.registrationStartsAt || "",
    registration_closes_at: row.registration_ends_at || row.registrationEndsAt || "",
    max_attendees: Number(row.max_attendees || row.venue_capacity || 0),
    ticket_types_count: Number(row.ticket_types_count || 0),
    attendees_count: Number(row.attendees_count || row.registrations_count || 0),
    review_count: Number(row.review_count || 0),
    revenue: "",
    hero_image: row.cover_image_url || "",
    organizer: row.organizer_name || "",
  }
}

function normalizeTicket(row: any): TicketType {
  return {
    id: Number(row.id),
    event_id: Number(row.event_id || row.eventId),
    name_en: row.name_en || row.nameEn || "Ticket",
    name_ar: row.name_ar || row.nameAr || row.name_en || row.nameEn || "Ticket",
    code: row.code || `TICKET-${row.id}`,
    quota: Number(row.quota || 0),
    sold_count: Number(row.sold_count || 0),
    max_per_order: Number(row.per_order_limit || row.maxPerOrder || 1),
    visibility: "public",
    benefits: [],
    description: row.description_en || row.descriptionEn || "",
  }
}

function normalizePeriod(row: any, eventId: number): PricePeriod {
  const startsAt = row.starts_at || row.startsAt || ""
  const endsAt = row.ends_at || row.endsAt || ""
  return {
    id: Number(row.id),
    event_id: eventId,
    ticket_id: Number(row.ticket_type_id || row.ticketTypeId),
    label: row.label_en || row.labelEn || "Price period",
    starts_at: startsAt,
    ends_at: endsAt,
    price: Number(row.price_usd ?? row.price ?? row.price_egp ?? 0),
    currency: row.currency || "USD",
    status: row.is_active === 0 || row.is_active === false ? "ended" : periodStatus(startsAt, endsAt),
  }
}

export function EventsManager() {
  const { language } = useLanguage()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [deletedEvents, setDeletedEvents] = useState<AdminEvent[]>([])
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [pricePeriods, setPricePeriods] = useState<PricePeriod[]>([])
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(() => readCurrencySettings())
  const [activeEventId, setActiveEventId] = useState(0)
  const [activeTicketId, setActiveTicketId] = useState(0)
  const [ticketForm, setTicketForm] = useState<TicketForm>(emptyTicketForm)
  const [periodForm, setPeriodForm] = useState({ label: "Special Window", startsAt: "", endsAt: "", price: "100", currency: "USD" })

  const selectedTickets = useMemo(() => tickets.filter((ticket) => ticket.event_id === activeEventId), [activeEventId, tickets])
  const selectedTicket = tickets.find((ticket) => ticket.id === activeTicketId) || selectedTickets[0]
  const selectedPeriods = useMemo(() => pricePeriods.filter((period) => period.event_id === activeEventId), [activeEventId, pricePeriods])
  const enabledCurrencies = useMemo(() => enabledCurrencyRates(currencySettings), [currencySettings])

  useEffect(() => {
    const syncCurrencySettings = () => setCurrencySettings(readCurrencySettings())
    window.addEventListener("stylish-events-currency-settings-updated", syncCurrencySettings)
    window.addEventListener("storage", syncCurrencySettings)
    return () => {
      window.removeEventListener("stylish-events-currency-settings-updated", syncCurrencySettings)
      window.removeEventListener("storage", syncCurrencySettings)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadLiveData() {
      try {
        const liveEvents = (await platformApi.listEvents({ includeDeleted: true })).map(normalizeEvent)
        const liveTickets = (await platformApi.listTickets()).map(normalizeTicket)
        const periodGroups = await Promise.all(liveTickets.map(async (ticket) => {
          const rows = await platformApi.listPricePeriods(ticket.id)
          return rows.map((row) => normalizePeriod(row, ticket.event_id))
        }))

        if (!active) return
        const visibleEvents = liveEvents.filter((event) => event.status !== ("deleted" as EventStatus))
        setEvents(visibleEvents)
        setDeletedEvents(liveEvents.filter((event: any) => event.status === "deleted"))
        setTickets(liveTickets)
        setPricePeriods(periodGroups.flat())
        setActiveEventId((current) => current || visibleEvents[0]?.id || 0)
        setActiveTicketId((current) => current || liveTickets[0]?.id || 0)
        setTicketForm((current) => ({ ...current, eventId: String(visibleEvents[0]?.id || "") }))
      } catch (error) {
        if (!active) return
        setEvents([])
        setTickets([])
        setPricePeriods([])
        toast.error("Could not load events", {
          description: error instanceof Error ? error.message : "Please check the backend and MySQL connection.",
        })
      }
    }

    loadLiveData()
    return () => {
      active = false
    }
  }, [])

  const eventTitle = (event: AdminEvent) => language === "ar" ? event.title_ar : event.title_en

  const setTicketField = <K extends keyof TicketForm>(key: K, value: TicketForm[K]) => {
    setTicketForm((current) => ({ ...current, [key]: value }))
  }

  const updateTicketPeriod = (index: number, key: keyof TicketForm["periods"][number], value: string) => {
    setTicketForm((current) => ({
      ...current,
      periods: current.periods.map((period, periodIndex) => periodIndex === index ? { ...period, [key]: value } : period),
    }))
  }

  const addTicketPeriodRow = () => {
    setTicketForm((current) => ({
      ...current,
      periods: [...current.periods, { label: "New period", startsAt: "", endsAt: "", price: "100", currency: currencySettings.baseCurrency }],
    }))
  }

  const removeTicketPeriodRow = (index: number) => {
    setTicketForm((current) => ({
      ...current,
      periods: current.periods.filter((_, periodIndex) => periodIndex !== index),
    }))
  }

  const createTicket = async () => {
    if (!ticketForm.nameAr || !ticketForm.nameEn || ticketForm.periods.length === 0) return

    const eventId = Number(ticketForm.eventId)
    if (!eventId) return

    try {
      const saved = await platformApi.createTicket({
        eventId,
        nameEn: ticketForm.nameEn,
        nameAr: ticketForm.nameAr,
        descriptionEn: ticketForm.description,
        descriptionAr: ticketForm.description,
        quota: Number(ticketForm.quota) || null,
        perOrderLimit: Number(ticketForm.maxPerOrder) || 1,
        isActive: ticketForm.visibility !== "hidden",
      })
      const nextTicket = normalizeTicket(saved)
      const nextPeriods = await Promise.all(ticketForm.periods.map((period) => platformApi.createPricePeriod({
        ticketTypeId: nextTicket.id,
        labelEn: period.label,
        labelAr: period.label,
        price: Number(period.price) || 0,
        priceEgp: period.currency === "EGP" ? Number(period.price) || 0 : Number(period.price) || 0,
        priceUsd: period.currency === "USD" ? Number(period.price) || 0 : Number(period.price) || 0,
        startsAt: period.startsAt,
        endsAt: period.endsAt,
        isActive: true,
      })))

      setTickets((current) => [nextTicket, ...current])
      setPricePeriods((current) => [...nextPeriods.map((period) => normalizePeriod(period, eventId)), ...current])
      setEvents((current) => current.map((event) => event.id === eventId ? { ...event, ticket_types_count: event.ticket_types_count + 1 } : event))
      setActiveEventId(eventId)
      setActiveTicketId(nextTicket.id)
      setTicketForm({ ...emptyTicketForm, eventId: String(eventId) })
      toast.success("Ticket created", { description: "Ticket type and pricing periods were saved to MySQL." })
    } catch (error) {
      toast.error("Ticket creation failed", { description: error instanceof Error ? error.message : "Please check the ticket data." })
    }
  }

  const addPricingPeriod = async () => {
    if (!selectedTicket || !periodForm.startsAt || !periodForm.endsAt) return
    try {
      const saved = await platformApi.createPricePeriod({
        ticketTypeId: selectedTicket.id,
        labelEn: periodForm.label,
        labelAr: periodForm.label,
        price: Number(periodForm.price) || 0,
        priceEgp: Number(periodForm.price) || 0,
        priceUsd: Number(periodForm.price) || 0,
        startsAt: periodForm.startsAt,
        endsAt: periodForm.endsAt,
        isActive: true,
      })
      setPricePeriods((current) => [normalizePeriod(saved, selectedTicket.event_id), ...current])
      setPeriodForm({ label: "Special Window", startsAt: "", endsAt: "", price: "100", currency: currencySettings.baseCurrency })
      toast.success("Pricing period added", { description: "The new date window was saved to MySQL." })
    } catch (error) {
      toast.error("Pricing period failed", { description: error instanceof Error ? error.message : "Could not save this period." })
    }
  }

  const deletePricingPeriod = async (id: number) => {
    try {
      await platformApi.deletePricePeriod(id)
      setPricePeriods((current) => current.filter((period) => period.id !== id))
      toast.success("Pricing period disabled")
    } catch (error) {
      toast.error("Pricing update failed", { description: error instanceof Error ? error.message : "Could not disable this period." })
    }
  }

  const updateStatus = async (id: number, status: EventStatus) => {
    try {
      await platformApi.updateEventStatus(id, status)
      setEvents((current) => current.map((event) => event.id === id ? { ...event, status } : event))
      toast.success("Event status updated", { description: `Event moved to ${status}.` })
    } catch (error) {
      toast.error("Event status failed", { description: error instanceof Error ? error.message : "Could not update event." })
    }
  }

  const deleteEvent = async (id: number) => {
    const eventToDelete = events.find((event) => event.id === id)
    try {
      await platformApi.deleteEvent(id)
      if (eventToDelete) setDeletedEvents((current) => [{ ...eventToDelete, status: "deleted" }, ...current])
      setEvents((current) => current.filter((event) => event.id !== id))
      toast.success("Event deleted", { description: "Event was moved to deleted items." })
    } catch (error) {
      toast.error("Delete failed", { description: error instanceof Error ? error.message : "Could not delete event." })
    }
  }

  const restoreEvent = async (id: number) => {
    const eventToRestore = deletedEvents.find((event) => event.id === id)
    if (!eventToRestore) return
    try {
      await platformApi.restoreEvent(id)
      setEvents((current) => [{ ...eventToRestore, status: "draft" }, ...current])
      setDeletedEvents((current) => current.filter((event) => event.id !== id))
      toast.success("Event restored", { description: "Event returned to drafts." })
    } catch (error) {
      toast.error("Restore failed", { description: error instanceof Error ? error.message : "Could not restore event." })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">{adminT(language, "events.management")}</Badge>
          <h1 className="text-xl font-extrabold tracking-tight text-[#17172f] md:text-2xl">{adminT(language, "events.title")}</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
            {adminT(language, "events.subtitle")}
          </p>
        </div>

        <Button asChild className="h-10 rounded-2xl bg-[hsl(var(--primary))] px-4 text-sm font-extrabold text-white hover:bg-[hsl(var(--primary)/0.9)]">
          <Link href="/admin/events/create">
            <Plus className="h-4 w-4" />
            {adminT(language, "events.createEvent")}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="events" className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: adminT(language, "overview.totalEvents"), value: events.length, icon: CalendarDays },
            { label: adminT(language, "overview.published"), value: events.filter((event) => event.status === "published").length, icon: PlayCircle },
            { label: adminT(language, "overview.registrations"), value: events.reduce((sum, event) => sum + event.attendees_count, 0).toLocaleString(), icon: Users },
            { label: adminT(language, "overview.seats"), value: events.reduce((sum, event) => sum + event.max_attendees, 0).toLocaleString(), icon: Ticket },
          ].map((item) => <MetricCard key={item.label} {...item} />)}
        </div>

        <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-white/70 p-1 lg:w-[760px]">
          <TabsTrigger value="events" className="rounded-xl">{adminT(language, "events.eventsTab")}</TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-xl">{adminT(language, "events.ticketsTab")}</TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-xl">{adminT(language, "events.pricingTab")}</TabsTrigger>
          <TabsTrigger value="drafts" className="rounded-xl">{adminT(language, "events.draftsTab")}</TabsTrigger>
          <TabsTrigger value="deleted" className="rounded-xl">{adminT(language, "events.deletedTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <EventsTable language={language} events={events} eventTitle={eventTitle} setActiveEventId={setActiveEventId} updateStatus={updateStatus} deleteEvent={deleteEvent} />
        </TabsContent>

        <TabsContent value="tickets" className="grid gap-5 xl:grid-cols-[520px_1fr]">
          <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-extrabold">
                <Ticket className="h-5 w-5 text-[hsl(var(--primary))]" />
                New Ticket Type
              </CardTitle>
              <p className="text-sm font-medium text-slate-400">{adminT(language, "events.newTicketTypeCopy")}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{adminT(language, "common.event")}</Label>
                <Select value={ticketForm.eventId} onValueChange={(value) => setTicketField("eventId", value)}>
                  <SelectTrigger className="h-11 rounded-2xl bg-slate-50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={String(event.id)}>{eventTitle(event)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Arabic ticket name" value={ticketForm.nameAr} onChange={(value) => setTicketField("nameAr", value)} className="md:col-span-2" />
                <Field label="English ticket name" value={ticketForm.nameEn} onChange={(value) => setTicketField("nameEn", value)} className="md:col-span-2" />
                <Field label="Ticket code" value={ticketForm.code} onChange={(value) => setTicketField("code", value)} placeholder="VIP-DTS" />
                <SelectField label="Visibility" value={ticketForm.visibility} onChange={(value) => setTicketField("visibility", value as TicketType["visibility"])} options={["public", "private", "hidden"]} />
                <Field label="Quota" value={ticketForm.quota} onChange={(value) => setTicketField("quota", value)} type="number" />
                <Field label="Max per order" value={ticketForm.maxPerOrder} onChange={(value) => setTicketField("maxPerOrder", value)} type="number" />
              </div>

              <TextAreaField label="Ticket description" value={ticketForm.description} onChange={(value) => setTicketField("description", value)} placeholder="Access rules, seat type, audience..." />
              <TextAreaField label="Benefits, one per line" value={ticketForm.benefits} onChange={(value) => setTicketField("benefits", value)} />

              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-[#17172f]">{adminT(language, "events.ticketPeriods")}</p>
                    <p className="text-xs font-bold text-slate-400">{adminT(language, "events.ticketPeriodsCopy")}</p>
                  </div>
                  <Button type="button" variant="outline" onClick={addTicketPeriodRow} className="h-9 rounded-xl text-xs font-bold">
                    <Plus className="h-3.5 w-3.5" />
                    Period
                  </Button>
                </div>

                <div className="space-y-3">
                  {ticketForm.periods.map((period, index) => (
                    <div key={index} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-[hsl(var(--primary)/0.10)] px-3 py-1 text-[11px] font-extrabold text-[hsl(var(--primary))]">
                          Period {index + 1}
                        </span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTicketPeriodRow(index)} className="h-8 w-8 rounded-xl text-red-500">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        <PeriodInput label="Label" value={period.label} onChange={(value) => updateTicketPeriod(index, "label", value)} placeholder="Early Bird" />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <PeriodInput label="Start date/time" type="datetime-local" value={period.startsAt} onChange={(value) => updateTicketPeriod(index, "startsAt", value)} />
                          <PeriodInput label="End date/time" type="datetime-local" value={period.endsAt} onChange={(value) => updateTicketPeriod(index, "endsAt", value)} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                          <PeriodInput label="Price" type="number" value={period.price} onChange={(value) => updateTicketPeriod(index, "price", value)} />
                          <CurrencySelect value={period.currency} currencies={enabledCurrencies} onChange={(value) => updateTicketPeriod(index, "currency", value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ConfirmAction title="Confirm Ticket Creation" description="A new ticket type and its pricing periods will be added to the selected event." confirmLabel="Add ticket" onConfirm={createTicket}>
                <Button className="h-11 w-full rounded-xl font-bold">
                  <Plus className="h-4 w-4" />
                  Add Ticket
                </Button>
              </ConfirmAction>
            </CardContent>
          </Card>

          <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-extrabold">{adminT(language, "events.eventTickets")}</CardTitle>
                <p className="mt-1 text-sm font-medium text-slate-400">{adminT(language, "events.eventTicketsCopy")}</p>
              </div>
              <Select value={String(activeEventId)} onValueChange={(value) => {
                const nextEventId = Number(value)
                setActiveEventId(nextEventId)
                const firstTicket = tickets.find((ticket) => ticket.event_id === nextEventId)
                if (firstTicket) setActiveTicketId(firstTicket.id)
                setTicketForm((current) => ({ ...current, eventId: value }))
              }}>
                <SelectTrigger className="h-10 rounded-2xl bg-[#f8f5fb] font-bold md:w-80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => <SelectItem key={event.id} value={String(event.id)}>{eventTitle(event)}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {selectedTickets.map((ticket) => {
                const soldPercent = ticket.quota ? Math.round((ticket.sold_count / ticket.quota) * 100) : 0
                const ticketPeriods = pricePeriods.filter((period) => period.ticket_id === ticket.id)
                return (
                  <button
                    type="button"
                    key={ticket.id}
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={cn(
                      "rounded-2xl border bg-white p-4 text-start transition hover:border-[hsl(var(--primary)/0.45)] hover:bg-[hsl(var(--primary)/0.03)]",
                      activeTicketId === ticket.id && "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-[#17172f]">{ticket.name_en}</p>
                        <p className="text-sm font-medium text-slate-400">{ticket.sold_count}/{ticket.quota} sold</p>
                      </div>
                      <Badge className="rounded-xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.10)]">
                        {ticketPriceRange(ticket, pricePeriods, currencySettings)}
                      </Badge>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-[hsl(var(--primary))]" style={{ width: `${soldPercent}%` }} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {ticketPeriods.map((period) => (
                        <span key={period.id} className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-500">
                          {period.label}: {money(period.price, period.currency, currencySettings)}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-5">
          <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-extrabold">
                  <BadgeDollarSign className="h-5 w-5 text-[hsl(var(--primary))]" />
                  Pricing Periods
                </CardTitle>
                <p className="mt-1 text-sm font-medium text-slate-400">{adminT(language, "events.manageDatePrices")}</p>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Select value={String(activeEventId)} onValueChange={(value) => {
                  const nextEventId = Number(value)
                  setActiveEventId(nextEventId)
                  const firstTicket = tickets.find((ticket) => ticket.event_id === nextEventId)
                  if (firstTicket) setActiveTicketId(firstTicket.id)
                }}>
                  <SelectTrigger className="h-10 rounded-2xl bg-[#f8f5fb] font-bold md:w-72"><SelectValue /></SelectTrigger>
                  <SelectContent>{events.map((event) => <SelectItem key={event.id} value={String(event.id)}>{eventTitle(event)}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={String(activeTicketId)} onValueChange={(value) => setActiveTicketId(Number(value))}>
                  <SelectTrigger className="h-10 rounded-2xl bg-[#f8f5fb] font-bold md:w-56"><SelectValue placeholder="Ticket" /></SelectTrigger>
                  <SelectContent>{selectedTickets.map((ticket) => <SelectItem key={ticket.id} value={String(ticket.id)}>{ticket.name_en}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 rounded-[22px] bg-slate-50 p-4 xl:grid-cols-[1.1fr_1fr_1fr_120px_110px_auto]">
                <PeriodInput label="Period label" value={periodForm.label} onChange={(value) => setPeriodForm({ ...periodForm, label: value })} placeholder="Special Window" surface="white" />
                <PeriodInput label="Starts" type="datetime-local" value={periodForm.startsAt} onChange={(value) => setPeriodForm({ ...periodForm, startsAt: value })} surface="white" />
                <PeriodInput label="Ends" type="datetime-local" value={periodForm.endsAt} onChange={(value) => setPeriodForm({ ...periodForm, endsAt: value })} surface="white" />
                <PeriodInput label="Price" type="number" value={periodForm.price} onChange={(value) => setPeriodForm({ ...periodForm, price: value })} surface="white" />
                <CurrencySelect value={periodForm.currency} currencies={enabledCurrencies} onChange={(value) => setPeriodForm({ ...periodForm, currency: value })} surface="white" />
                <ConfirmAction title="Add pricing period?" description="This date window will be added to the selected ticket." confirmLabel="Add period" onConfirm={addPricingPeriod}>
                  <Button className="mt-auto h-11 rounded-2xl font-extrabold"><Plus className="h-4 w-4" />{adminT(language, "common.addNew")}</Button>
                </ConfirmAction>
              </div>

              <div className="overflow-hidden rounded-[22px] border border-slate-100">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>{adminT(language, "common.ticket")}</TableHead>
                      <TableHead>{adminT(language, "events.period")}</TableHead>
                      <TableHead>{adminT(language, "events.start")}</TableHead>
                      <TableHead>{adminT(language, "events.end")}</TableHead>
                      <TableHead>{adminT(language, "events.price")}</TableHead>
                      <TableHead>{adminT(language, "common.status")}</TableHead>
                      <TableHead className="w-20 text-center">{adminT(language, "common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPeriods.map((period) => {
                      const ticket = tickets.find((item) => item.id === period.ticket_id)
                      return (
                        <TableRow key={period.id} className="hover:bg-[hsl(var(--primary)/0.04)]">
                          <TableCell className="font-extrabold text-[#17172f]">{ticket?.name_en || "Ticket"}</TableCell>
                          <TableCell className="font-bold text-slate-600">{period.label}</TableCell>
                          <TableCell><TableDateTime value={period.starts_at} /></TableCell>
                          <TableCell><TableDateTime value={period.ends_at} /></TableCell>
                          <TableCell className="font-extrabold">{money(period.price, period.currency, currencySettings)}</TableCell>
                          <TableCell><Badge className={cn("rounded-xl capitalize", periodBadge(period.status))}>{period.status}</Badge></TableCell>
                          <TableCell className="text-center">
                            <ConfirmAction title="Delete pricing period?" description="This price window will be removed from the ticket." confirmLabel="Delete" tone="danger" onConfirm={() => deletePricingPeriod(period.id)}>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </ConfirmAction>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
            <CardHeader><CardTitle className="text-sm font-extrabold">{adminT(language, "events.draftEvents")}</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {events.filter((event) => event.status === "draft").map((event) => (
                <div key={event.id} className="rounded-2xl border bg-white p-4">
                  <p className="font-extrabold">{eventTitle(event)}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">{event.slug}</p>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="outline" className="h-9 rounded-xl text-xs font-bold"><Link href={`/admin/events/${event.id}`}>{adminT(language, "common.preview")}</Link></Button>
                    <ConfirmAction title="Publish draft?" description="This draft will become a published event." confirmLabel="Publish" onConfirm={() => updateStatus(event.id, "published")}>
                      <Button className="h-9 rounded-xl bg-[hsl(var(--primary))] text-xs font-bold text-white">{adminT(language, "common.publish")}</Button>
                    </ConfirmAction>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deleted">
          <Card className="rounded-[26px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
            <CardHeader><CardTitle className="text-sm font-extrabold">{adminT(language, "events.deletedEvents")}</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {deletedEvents.length === 0 && <p className="text-sm font-medium text-slate-400">{adminT(language, "events.noDeletedEvents")}</p>}
              {deletedEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-red-100 bg-red-50/40 p-4">
                  <p className="font-extrabold">{eventTitle(event)}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">{event.slug}</p>
                  <Button onClick={() => restoreEvent(event.id)} className="mt-4 h-9 rounded-xl bg-white text-xs font-bold text-red-600 hover:bg-white">{adminT(language, "common.restore")}</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
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

function EventsTable({
  language,
  events,
  eventTitle,
  setActiveEventId,
  updateStatus,
  deleteEvent,
}: {
  language: "ar" | "en"
  events: AdminEvent[]
  eventTitle: (event: AdminEvent) => string
  setActiveEventId: (id: number) => void
  updateStatus: (id: number, status: EventStatus) => void
  deleteEvent: (id: number) => void
}) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
      <CardHeader className="flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base font-extrabold">{adminT(language, "events.eventsTable")}</CardTitle>
          <p className="mt-1 text-sm font-medium text-slate-400">{adminT(language, "events.eventsTableCopy")}</p>
        </div>
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
          <Input className="h-10 rounded-2xl bg-[#f8f5fb] pl-9" placeholder={language === "ar" ? "ابحث عن فعالية..." : "Search event..."} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[1120px]">
            <TableHeader>
              <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                <TableHead className="w-14 text-center">#</TableHead>
                <TableHead>{language === "ar" ? "اسم الفعالية" : "Event Name"}</TableHead>
                <TableHead>{adminT(language, "events.location")}</TableHead>
                <TableHead>{adminT(language, "events.rating")}</TableHead>
                <TableHead>{adminT(language, "overview.seats")}</TableHead>
                <TableHead>{adminT(language, "events.users")}</TableHead>
                <TableHead>{adminT(language, "events.start")}</TableHead>
                <TableHead>{adminT(language, "events.end")}</TableHead>
                <TableHead>{adminT(language, "common.status")}</TableHead>
                <TableHead className="w-20 text-center">{adminT(language, "common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => {
                const seatsPercent = Math.min(100, Math.round((event.attendees_count / event.max_attendees) * 100))
                return (
                  <TableRow key={event.id} className="align-top hover:bg-[hsl(var(--primary)/0.04)]">
                    <TableCell className="text-center text-sm font-bold text-slate-400">{index + 1}</TableCell>
                    <TableCell>
                      <div className="max-w-[230px]">
                        <p className="line-clamp-1 text-sm font-extrabold text-[#17172f]">{eventTitle(event)}</p>
                        <p className="line-clamp-1 text-xs font-medium text-slate-400">{event.slug}</p>
                        <Badge className="mt-2 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]">{event.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[210px] gap-2 text-sm font-semibold text-slate-500">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm font-extrabold">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {event.rating || "-"}
                      </div>
                      <p className="text-xs font-medium text-slate-400">{event.review_count} {language === "ar" ? "مراجعة" : "reviews"}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-extrabold">{event.max_attendees.toLocaleString()}</p>
                      <Progress value={seatsPercent} className="mt-2 h-2 w-24 bg-slate-100 [&>div]:bg-[hsl(var(--primary))]" />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-extrabold">{event.attendees_count.toLocaleString()}</p>
                      <p className="text-xs font-medium text-slate-400">{seatsPercent}% {language === "ar" ? "محجوز" : "booked"}</p>
                    </TableCell>
                    <TableCell><TableDateTime value={event.starts_at} /></TableCell>
                    <TableCell><TableDateTime value={event.ends_at} /></TableCell>
                    <TableCell><Badge className={cn("rounded-xl capitalize", statusBadge(event.status))}>{adminStatusT(language, event.status)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl bg-slate-50">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl border-0 p-2 shadow-xl">
                            <DropdownMenuLabel className="text-xs text-slate-400">{adminT(language, "common.actions")}</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                              <Link href={`/admin/events/${event.id}`}><Eye className="h-4 w-4" />{adminT(language, "common.viewDetails")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                              <Link href={`/admin/events/${event.id}/edit`}><Edit3 className="h-4 w-4" />{adminT(language, "events.editEvent")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <ConfirmAction title="Display in Upcoming?" description="Event will be shown in Upcoming Events." confirmLabel="Publish" onConfirm={() => updateStatus(event.id, "published")}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl"><PlayCircle className="h-4 w-4" />Upcoming</DropdownMenuItem>
                              </ConfirmAction>
                              <ConfirmAction title="Display in Previous?" description="Event will be shown in Previous Events." confirmLabel="Move" onConfirm={() => updateStatus(event.id, "completed")}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl"><CheckCircle2 className="h-4 w-4" />Previous</DropdownMenuItem>
                              </ConfirmAction>
                              <ConfirmAction title="Move to draft?" description="This event will move to Drafts and be hidden." confirmLabel="Draft" onConfirm={() => updateStatus(event.id, "draft")}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl"><RotateCcw className="h-4 w-4" />{adminT(language, "common.moveToDraft")}</DropdownMenuItem>
                              </ConfirmAction>
                              <DropdownMenuSeparator />
                              {event.status === "disabled" ? (
                                <ConfirmAction title="Enable event?" description="The event will be visible again." confirmLabel="Enable" onConfirm={() => updateStatus(event.id, "published")}>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl text-emerald-600"><PlayCircle className="h-4 w-4" />{language === "ar" ? "تفعيل" : "Enable"}</DropdownMenuItem>
                                </ConfirmAction>
                              ) : (
                                <ConfirmAction title="Disable event?" description="The event will stop accepting public operations." confirmLabel="Disable" tone="danger" onConfirm={() => updateStatus(event.id, "disabled")}>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl text-amber-600"><PauseCircle className="h-4 w-4" />{adminT(language, "common.disable")}</DropdownMenuItem>
                                </ConfirmAction>
                              )}
                            <DropdownMenuSeparator />
                            <ConfirmAction title="Delete event?" description="This event will move to Deleted and can be restored later." confirmLabel="Delete" tone="danger" onConfirm={() => deleteEvent(event.id)}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-xl text-red-600"><Trash2 className="h-4 w-4" />{adminT(language, "common.delete")}</DropdownMenuItem>
                            </ConfirmAction>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({ label, value, onChange, type = "text", placeholder, className }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 rounded-2xl border-slate-200 bg-white font-bold" />
    </div>
  )
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-[106px] rounded-2xl border-slate-200 bg-white font-semibold leading-6" />
    </div>
  )
}

function PeriodInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  surface = "slate",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  surface?: "slate" | "white"
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 min-w-0 rounded-xl border-slate-200 text-sm font-bold",
          surface === "white" ? "bg-white" : "bg-slate-50"
        )}
      />
    </div>
  )
}

function CurrencySelect({
  value,
  onChange,
  currencies,
  surface = "slate",
}: {
  value: string
  onChange: (value: string) => void
  currencies: CurrencyRate[]
  surface?: "slate" | "white"
}) {
  const { language } = useLanguage()

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">{adminT(language, "common.currency")}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "h-10 min-w-0 rounded-xl border-slate-200 text-sm font-bold",
            surface === "white" ? "bg-white" : "bg-slate-50"
          )}
        >
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

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white font-bold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

