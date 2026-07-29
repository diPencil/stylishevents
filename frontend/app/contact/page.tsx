"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Headphones,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  UserCheck,
  UserRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { PublicPageFrame, PublicPageHero } from "@/components/public/page-building-blocks"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { DEFAULT_CONTACT_PAGE_SETTINGS, normalizeContactPageSettings } from "@/lib/site-content-defaults"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import type {
  ContactBenefitCardSettings,
  ContactCardIcon,
  ContactInformationCardSettings,
  ContactPageSettings,
} from "@/types/platform"

type ContactInquiryType =
  | "general"
  | "event_planning"
  | "technical_support"
  | "partnership"
  | "existing_booking"
  | "other"

type PreferredContactMethod = "email" | "phone" | "whatsapp"

type InquiryFormValues = {
  fullName: string
  email: string
  phoneCountryCode: string
  phoneNumber: string
  company: string
  inquiryType: ContactInquiryType
  preferredContactMethod: PreferredContactMethod
  subject: string
  message: string
  eventDate: string
  eventCity: string
  expectedAttendees: string
  consentAccepted: boolean
  website: string
}

type FormErrors = Partial<Record<keyof InquiryFormValues, string>>

const messageLimit = 2000
const messageMin = 20

const emptyForm: InquiryFormValues = {
  fullName: "",
  email: "",
  phoneCountryCode: "+20",
  phoneNumber: "",
  company: "",
  inquiryType: "general",
  preferredContactMethod: "email",
  subject: "",
  message: "",
  eventDate: "",
  eventCity: "",
  expectedAttendees: "",
  consentAccepted: false,
  website: "",
}

const iconMap: Record<ContactCardIcon, LucideIcon> = {
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
  headphones: Headphones,
}

const benefitIconMap: Record<ContactBenefitCardSettings["icon"], LucideIcon> = {
  message: MessageSquareText,
  userCheck: UserCheck,
  calendar: CalendarDays,
  lifeBuoy: LifeBuoy,
}

const contactMethods = [
  { value: "email", labelEn: "Email", labelAr: "البريد الإلكتروني" },
  { value: "phone", labelEn: "Phone", labelAr: "الهاتف" },
  { value: "whatsapp", labelEn: "WhatsApp", labelAr: "واتساب" },
] as const

const countryCodes = [
  { value: "+20", label: "EG +20" },
  { value: "+966", label: "SA +966" },
  { value: "+971", label: "AE +971" },
  { value: "+965", label: "KW +965" },
  { value: "+974", label: "QA +974" },
  { value: "+973", label: "BH +973" },
  { value: "+968", label: "OM +968" },
]

export default function ContactPage() {
  const { isRtl, language } = useLanguage()
  const [settings, setSettings] = useState<ContactPageSettings>(() => normalizeContactPageSettings(DEFAULT_CONTACT_PAGE_SETTINGS))
  const [form, setForm] = useState<InquiryFormValues>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [success, setSuccess] = useState<{ referenceCode: string; createdAt?: string } | null>(null)
  const startedAtRef = useRef(Date.now())

  useEffect(() => {
    platformApi.getSiteContentSettings()
      .then((data) => setSettings(normalizeContactPageSettings(data?.contactPage)))
      .catch(() => setSettings(normalizeContactPageSettings(DEFAULT_CONTACT_PAGE_SETTINGS)))
  }, [])

  const visibleCards = useMemo(() => settings.contactCards.filter((card) => card.enabled).slice(0, 4), [settings.contactCards])
  const request = settings.requestSection
  const labels = request.fieldLabels
  const placeholders = request.placeholders
  const enabledInquiryTypes = useMemo(() => {
    const sorted = [...request.inquiryTypes].filter((item) => item.enabled).sort((a, b) => a.order - b.order)
    return sorted.length ? sorted : request.inquiryTypes.slice(0, 1)
  }, [request.inquiryTypes])
  const showEventFields = form.inquiryType === "event_planning"
  const benefits = request.benefits.slice(0, 3)

  function text(en: string, ar: string) {
    return isRtl ? ar : en
  }

  function update<K extends keyof InquiryFormValues>(key: K, value: InquiryFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError("")
  }

  function validate() {
    const nextErrors: FormErrors = {}
    if (form.fullName.trim().length < 2) nextErrors.fullName = text("Full name is required.", "الاسم الكامل مطلوب.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = text("Enter a valid email address.", "أدخل بريدا إلكترونيا صحيحا.")
    if (form.phoneNumber.trim() && !/^[0-9\s().-]{7,30}$/.test(form.phoneNumber.trim())) nextErrors.phoneNumber = text("Enter a valid phone number.", "أدخل رقم هاتف صحيحا.")
    if (!form.inquiryType) nextErrors.inquiryType = text("Choose an inquiry type.", "اختر نوع الاستفسار.")
    if (form.subject.trim().length < 3) nextErrors.subject = text("Subject is required.", "الموضوع مطلوب.")
    if (form.message.trim().length < messageMin) nextErrors.message = text("Write a clearer message.", "اكتب رسالة أوضح.")
    if (form.message.length > messageLimit) nextErrors.message = text("Message is too long.", "الرسالة أطول من الحد المسموح.")
    if (form.expectedAttendees.trim() && (!/^\d+$/.test(form.expectedAttendees.trim()) || Number(form.expectedAttendees) < 1)) {
      nextErrors.expectedAttendees = text("Expected attendees must be a positive number.", "عدد الحضور يجب أن يكون رقما صحيحا.")
    }
    if (!form.consentAccepted) nextErrors.consentAccepted = text("Consent is required.", "الموافقة مطلوبة.")
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function clearForm() {
    setForm(emptyForm)
    setErrors({})
    setSubmitError("")
    setSuccess(null)
    startedAtRef.current = Date.now()
  }

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !validate()) return
    setSubmitting(true)
    setSubmitError("")
    try {
      const result = await platformApi.submitContactInquiry({
        fullName: form.fullName,
        email: form.email,
        phoneCountryCode: form.phoneCountryCode,
        phoneNumber: form.phoneNumber,
        company: form.company,
        inquiryType: form.inquiryType,
        preferredContactMethod: form.preferredContactMethod,
        subject: form.subject,
        message: form.message,
        eventDate: showEventFields ? form.eventDate : "",
        eventCity: showEventFields ? form.eventCity : "",
        expectedAttendees: showEventFields && form.expectedAttendees ? Number(form.expectedAttendees) : "",
        consentAccepted: form.consentAccepted,
        consentVersion: "contact-inquiry-v1",
        sourcePage: "/contact",
        website: form.website,
        submittedAfterMs: Date.now() - startedAtRef.current,
      })
      setSuccess({ referenceCode: result.referenceCode, createdAt: result.createdAt })
      setErrors({})
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : text("Could not send inquiry.", "تعذر إرسال الاستفسار."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicPageFrame>
      {settings.hero.enabled ? (
        <PublicPageHero
          title={isRtl ? settings.hero.titleAr : settings.hero.titleEn}
          description={isRtl ? settings.hero.descriptionAr : settings.hero.descriptionEn}
          backgroundImage={settings.hero.imageUrl}
          imageAlt={isRtl ? settings.hero.imageAltAr : settings.hero.imageAltEn}
        />
      ) : null}

      <section id="contact-cards" className="bg-slate-50/60 px-4 py-12 sm:px-6 lg:py-16">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleCards.map((card) => (
              <ContactInfoCard key={card.id} card={card} isRtl={isRtl} />
            ))}
          </div>
        </div>
      </section>

      {request.enabled ? (
        <section id="contact-inquiry" className="bg-slate-50/60 px-4 pb-20 sm:px-6 lg:pb-28">
          <div className="container mx-auto max-w-7xl">
            <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div className="rounded-[28px] bg-[hsl(var(--primary))] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-8 lg:sticky lg:top-28">
                <span className="inline-flex rounded-full bg-white/18 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em]">
                  {isRtl ? request.eyebrowAr : request.eyebrowEn}
                </span>
                <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                  {isRtl ? request.titleAr : request.titleEn}
                </h2>
                <p className="mt-4 text-sm font-semibold leading-7 text-white/82">
                  {isRtl ? request.descriptionAr : request.descriptionEn}
                </p>
                <p className="mt-3 text-sm font-bold leading-7 text-white/68">
                  {isRtl ? request.supportingTextAr : request.supportingTextEn}
                </p>
                <div className="mt-7 grid gap-3">
                  {benefits.map((benefit) => (
                    <BenefitCard key={benefit.id} benefit={benefit} isRtl={isRtl} />
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-4 shadow-[0_22px_70px_rgba(15,23,42,0.09)] ring-1 ring-slate-100 sm:p-6">
                {success ? (
                  <SuccessState
                    settings={settings}
                    isRtl={isRtl}
                    referenceCode={success.referenceCode}
                    onReset={clearForm}
                  />
                ) : (
                  <form onSubmit={submitInquiry} className="space-y-5" noValidate>
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(event) => update("website", event.target.value)}
                      className="hidden"
                      aria-hidden="true"
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        name="fullName"
                        label={text(labels.fullNameEn, labels.fullNameAr)}
                        value={form.fullName}
                        placeholder={text(placeholders.fullNameEn, placeholders.fullNameAr)}
                        error={errors.fullName}
                        onChange={(value) => update("fullName", value)}
                        icon={UserRound}
                      />
                      <Field
                        name="email"
                        label={text(labels.emailEn, labels.emailAr)}
                        value={form.email}
                        placeholder={text(placeholders.emailEn, placeholders.emailAr)}
                        error={errors.email}
                        onChange={(value) => update("email", value)}
                        icon={Mail}
                        type="email"
                        dir="ltr"
                      />
                      <div className="space-y-2">
                        <Label className="text-sm font-extrabold text-slate-900">{text(labels.phoneEn, labels.phoneAr)}</Label>
                        <div className="grid grid-cols-[104px_1fr] gap-2" dir="ltr">
                          <select
                            value={form.phoneCountryCode}
                            onChange={(event) => update("phoneCountryCode", event.target.value)}
                            className="h-12 rounded-[12px] border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-primary"
                          >
                            {countryCodes.map((code) => <option key={code.value} value={code.value}>{code.label}</option>)}
                          </select>
                          <Input
                            value={form.phoneNumber}
                            onChange={(event) => update("phoneNumber", event.target.value)}
                            placeholder={text(placeholders.phoneEn, placeholders.phoneAr)}
                            inputMode="tel"
                            aria-invalid={!!errors.phoneNumber}
                            className={cn("h-12 rounded-[12px] border-slate-200 bg-slate-50 font-semibold", errors.phoneNumber && "border-red-400")}
                          />
                        </div>
                        {errors.phoneNumber ? <p className="text-xs font-bold text-red-600">{errors.phoneNumber}</p> : null}
                      </div>
                      <Field
                        name="company"
                        label={text(labels.companyEn, labels.companyAr)}
                        value={form.company}
                        placeholder={text(placeholders.companyEn, placeholders.companyAr)}
                        onChange={(value) => update("company", value)}
                        icon={Building2}
                      />
                      <SelectField
                        label={text(labels.inquiryTypeEn, labels.inquiryTypeAr)}
                        value={form.inquiryType}
                        error={errors.inquiryType}
                        onChange={(value) => update("inquiryType", value as ContactInquiryType)}
                        options={enabledInquiryTypes.map((item) => [item.value, isRtl ? item.labelAr : item.labelEn])}
                      />
                      <SelectField
                        label={text(labels.preferredContactEn, labels.preferredContactAr)}
                        value={form.preferredContactMethod}
                        onChange={(value) => update("preferredContactMethod", value as PreferredContactMethod)}
                        options={contactMethods.map((item) => [item.value, isRtl ? item.labelAr : item.labelEn])}
                      />
                    </div>

                    {showEventFields ? (
                      <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-3">
                        <Field
                          name="eventDate"
                          label={text(labels.eventDateEn, labels.eventDateAr)}
                          value={form.eventDate}
                          onChange={(value) => update("eventDate", value)}
                          type="date"
                          icon={CalendarDays}
                        />
                        <Field
                          name="eventCity"
                          label={text(labels.eventCityEn, labels.eventCityAr)}
                          value={form.eventCity}
                          placeholder={text(placeholders.eventCityEn, placeholders.eventCityAr)}
                          onChange={(value) => update("eventCity", value)}
                          icon={MapPin}
                        />
                        <Field
                          name="expectedAttendees"
                          label={text(labels.expectedAttendeesEn, labels.expectedAttendeesAr)}
                          value={form.expectedAttendees}
                          placeholder={text(placeholders.expectedAttendeesEn, placeholders.expectedAttendeesAr)}
                          error={errors.expectedAttendees}
                          onChange={(value) => update("expectedAttendees", value)}
                          inputMode="numeric"
                          icon={UserCheck}
                        />
                      </div>
                    ) : null}

                    <Field
                      name="subject"
                      label={text(labels.subjectEn, labels.subjectAr)}
                      value={form.subject}
                      placeholder={text(placeholders.subjectEn, placeholders.subjectAr)}
                      error={errors.subject}
                      onChange={(value) => update("subject", value)}
                      icon={MessageSquareText}
                    />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="contact-message" className="text-sm font-extrabold text-slate-900">{text(labels.messageEn, labels.messageAr)}</Label>
                        <span className={cn("text-xs font-bold", form.message.length > messageLimit ? "text-red-600" : "text-slate-400")}>{form.message.length}/{messageLimit}</span>
                      </div>
                      <Textarea
                        id="contact-message"
                        value={form.message}
                        onChange={(event) => update("message", event.target.value)}
                        placeholder={text(placeholders.messageEn, placeholders.messageAr)}
                        aria-invalid={!!errors.message}
                        className={cn("min-h-[180px] rounded-[14px] border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-7", isRtl && "text-right", errors.message && "border-red-400")}
                      />
                      <p className="text-xs font-semibold text-slate-500">{text(`Minimum ${messageMin} characters.`, `الحد الأدنى ${messageMin} حرفا.`)}</p>
                      {errors.message ? <p className="text-xs font-bold text-red-600">{errors.message}</p> : null}
                    </div>

                    <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">
                      <Checkbox checked={form.consentAccepted} onCheckedChange={(checked) => update("consentAccepted", checked === true)} />
                      <span>
                        {isRtl ? request.consentLabelAr : request.consentLabelEn}{" "}
                        <Link href="/privacy/" className="text-[hsl(var(--primary))] underline underline-offset-4">
                          {text("Privacy Policy", "سياسة الخصوصية")}
                        </Link>
                      </span>
                    </label>
                    {errors.consentAccepted ? <p className="text-xs font-bold text-red-600">{errors.consentAccepted}</p> : null}

                    {submitError ? (
                      <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                        <p>{isRtl ? request.errorTitleAr : request.errorTitleEn}</p>
                        <p className="mt-1 text-xs font-semibold">{submitError}</p>
                      </div>
                    ) : null}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Button type="button" variant="outline" disabled={submitting} onClick={clearForm} className="h-12 rounded-2xl px-6 font-extrabold">
                        {isRtl ? request.clearLabelAr : request.clearLabelEn}
                      </Button>
                      <Button type="submit" disabled={submitting} className="h-12 rounded-2xl px-7 font-extrabold">
                        <Send className="h-4 w-4" />
                        {submitting ? (isRtl ? request.sendingLabelAr : request.sendingLabelEn) : isRtl ? request.submitLabelAr : request.submitLabelEn}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </PublicPageFrame>
  )
}

function ContactInfoCard({ card, isRtl }: { card: ContactInformationCardSettings; isRtl: boolean }) {
  const Icon = iconMap[card.icon] || Phone
  const href = contactHref(card)

  return (
    <a
      href={href}
      target={card.linkType === "external" || card.linkType === "map" ? "_blank" : undefined}
      rel={card.linkType === "external" || card.linkType === "map" ? "noreferrer" : undefined}
      className="group block rounded-[24px] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)] ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.11)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{isRtl ? card.labelAr : card.labelEn}</p>
      <h3 className="mt-2 break-words text-lg font-black text-slate-950">{card.value}</h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{isRtl ? card.supportingTextAr : card.supportingTextEn}</p>
    </a>
  )
}

function BenefitCard({ benefit, isRtl }: { benefit: ContactBenefitCardSettings; isRtl: boolean }) {
  const Icon = benefitIconMap[benefit.icon] || MessageSquareText
  return (
    <div className="rounded-2xl bg-white/14 p-4">
      <Icon className="h-5 w-5 text-white" />
      <p className="mt-3 text-sm font-black">{isRtl ? benefit.titleAr : benefit.titleEn}</p>
      <p className="mt-2 text-xs font-bold leading-6 text-white/72">{isRtl ? benefit.textAr : benefit.textEn}</p>
    </div>
  )
}

function Field({
  name,
  label,
  value,
  onChange,
  icon: Icon,
  error,
  type = "text",
  inputMode,
  placeholder,
  dir,
}: {
  name: keyof InquiryFormValues
  label: string
  value: string
  onChange: (value: string) => void
  icon?: LucideIcon
  error?: string
  type?: string
  inputMode?: "text" | "tel" | "numeric"
  placeholder?: string
  dir?: "ltr" | "rtl"
}) {
  const fieldId = `contact-${String(name)}`
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-extrabold text-slate-900">{label}</Label>
      <div className={cn("flex h-12 items-center gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-4 transition focus-within:border-primary", error && "border-red-400")}>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" /> : null}
        <Input
          id={fieldId}
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          dir={dir}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className="h-10 border-0 bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0"
        />
      </div>
      {error ? <p id={`${fieldId}-error`} className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<readonly [string, string]>
  error?: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-extrabold text-slate-900">{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error}
        className={cn("h-12 w-full rounded-[12px] border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-primary", error && "border-red-400")}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  )
}

function SuccessState({
  settings,
  isRtl,
  referenceCode,
  onReset,
}: {
  settings: ContactPageSettings
  isRtl: boolean
  referenceCode: string
  onReset: () => void
}) {
  return (
    <div className="py-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-slate-950">{isRtl ? settings.successState.titleAr : settings.successState.titleEn}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-500">{isRtl ? settings.successState.descriptionAr : settings.successState.descriptionEn}</p>
      <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{isRtl ? "رقم الاستفسار" : "Inquiry reference"}</p>
        <p className="mt-1 text-xl font-black text-[hsl(var(--primary))]" dir="ltr">{referenceCode}</p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Button asChild variant="outline" className="h-11 rounded-2xl font-extrabold"><Link href="/">{isRtl ? "الرئيسية" : "Homepage"}</Link></Button>
        <Button asChild variant="outline" className="h-11 rounded-2xl font-extrabold"><Link href="/upcoming-events/">{isRtl ? "الفعاليات القادمة" : "Upcoming Events"}</Link></Button>
        <Button type="button" onClick={onReset} className="h-11 rounded-2xl font-extrabold">{isRtl ? "استفسار جديد" : "Submit another"}</Button>
      </div>
    </div>
  )
}

function contactHref(card: ContactInformationCardSettings) {
  const value = card.linkValue || card.value
  if (card.linkType === "phone") return `tel:${value.replace(/\s/g, "")}`
  if (card.linkType === "email") return `mailto:${value}`
  if (card.linkType === "whatsapp") return `https://wa.me/${value.replace(/[^\d]/g, "")}`
  if (card.linkType === "internal") return value.startsWith("/") ? value : `/${value}`
  if (card.linkType === "map" || card.linkType === "external") return /^https?:\/\//i.test(value) ? value : "#"
  return "#"
}
