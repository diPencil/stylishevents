"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { SuccessModal } from "./success-modal"
import { useLanguage } from "@/contexts/language-context"
import { ChevronsRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import countries from "i18n-iso-countries"
import ar from "i18n-iso-countries/langs/ar.json"
import en from "i18n-iso-countries/langs/en.json"
import { countryDialCode } from "@/lib/country-dial-codes"
import { DEFAULT_HOMEPAGE_REQUEST_SETUP } from "@/lib/site-content-defaults"
import type { HomepageRequestSetupSettings } from "@/types/platform"

countries.registerLocale(ar)
countries.registerLocale(en)

export function BookingForm({ requestSetupSettings }: { requestSetupSettings?: Partial<HomepageRequestSetupSettings> | null }) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const { t, isRtl, language } = useLanguage()
  const bookingApiBaseUrl = "https://stylish-events.com"
  const [step, setStep] = useState(1)
  const [countryCode, setCountryCode] = useState("+966")
  const content = { ...DEFAULT_HOMEPAGE_REQUEST_SETUP, ...(requestSetupSettings || {}) }

  const countryOptions = Object.entries(countries.getNames(language, { select: "official" })).map(
    ([code, name]) => ({
      value: code,
      label: name,
    })
  ).sort((a, b) => a.label.localeCompare(b.label))

  const countryCodes = [
    { code: "+966", name: "SA", label: "المملكة العربية السعودية" },
    { code: "+20", name: "EG", label: "مصر" },
    { code: "+971", name: "AE", label: "الإمارات" },
    { code: "+965", name: "KW", label: "الكويت" },
    { code: "+974", name: "QA", label: "قطر" },
    { code: "+973", name: "BH", label: "البحرين" },
    { code: "+968", name: "OM", label: "عمان" },
    { code: "+962", name: "JO", label: "الأردن" },
    { code: "+961", name: "LB", label: "لبنان" },
  ]

  const preferredCountryCodes = ["SA", "EG", "AE"]

  const formSchema = z.object({
    bookingType: z.enum(["single", "annual"]),
    fullName: z.string().min(2, { message: language === "ar" ? "الاسم الكامل مطلوب" : "Full name is required" }),
    email: z.string().email({ message: language === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email address" }),
    phone: z.string().min(9, { message: language === "ar" ? "رقم الجوال مطلوب" : "Phone number is required" }),
    jobTitle: z.string().min(2, { message: language === "ar" ? "المسمى الوظيفي مطلوب" : "Job title is required" }),
    eventName: z.string().min(2, { message: language === "ar" ? "اسم الحدث مطلوب" : "Event name is required" }),
    eventType: z.enum(["conference", "exhibition", "both"]),
    organization: z.string().optional(),
    expectedAttendance: z.string().min(1, { message: language === "ar" ? "عدد الحضور مطلوب" : "Expected attendance is required" }),
    eventDate: z.string().min(1, { message: language === "ar" ? "التاريخ مطلوب" : "Date is required" }),
    country: z.string().min(1, { message: language === "ar" ? "اختر الدولة" : "Select country" }),
    location: z.string().min(2, { message: language === "ar" ? "الموقع مطلوب" : "Location is required" }),
    services: z.array(z.string()).default([]),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingType: "single",
      fullName: "",
      email: "",
      phone: "",
      jobTitle: "",
      eventName: "",
      eventType: "conference",
      organization: "",
      expectedAttendance: "",
      eventDate: "",
      country: "SA",
      location: "",
      services: [],
    },
  })

  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    if (step === 1) fieldsToValidate = ["fullName", "email", "phone", "jobTitle"]
    if (step === 2) fieldsToValidate = ["eventName", "eventType", "expectedAttendance"]
    const isValid = await form.trigger(fieldsToValidate as any)
    if (isValid) setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Prepare data for backend API
      const payload = {
        ...values,
        countryCode,
        language,
      }

      // Send to backend API
      const response = await fetch(`${bookingApiBaseUrl}/api/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || (language === "ar" ? "حدث خطأ في الإرسال" : "Failed to submit booking"))
      }

      // Success! Show confirmation modal with booking number
      setBookingData({
        ...values,
        specialization: values.jobTitle,
        bookingNumber: result.bookingNumber,
        createdAt: result.createdAt,
      })
      setShowSuccess(true)

      // Optional: Still open WhatsApp with confirmation message
      const whatsappMessage = encodeURIComponent(
        `${isRtl ? "تم استقبال طلب حجزي برقم" : "My booking number is"}: ${result.bookingNumber}`
      )
      setTimeout(() => {
        window.open(`https://wa.me/201106653177?text=${whatsappMessage}`, "_blank")
      }, 2000)

    } catch (error) {
      const errorMsg =
        error instanceof TypeError
          ? language === "ar"
            ? "تعذر الوصول إلى خادم الحجز. تأكد أن الباك اند يعمل وأن رابط الـ API صحيح."
            : "Could not reach booking server. Ensure backend is running and API URL is correct."
          : error instanceof Error
            ? error.message
            : language === "ar"
              ? "حدث خطأ غير متوقع"
              : "An unexpected error occurred"
      setErrorMessage(errorMsg)
      console.error("Submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepTitles = [
    isRtl ? content.stepsAr[0] : content.stepsEn[0],
    isRtl ? content.stepsAr[1] : content.stepsEn[1],
    isRtl ? content.stepsAr[2] : content.stepsEn[2],
  ]

  if (!content.enabled) return null

  return (
    <section id="booking-form" className="py-24 bg-slate-50/50">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="bg-brand-blue rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 lg:p-16 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16">

          {/* Left Column (marketing) */}
          <div className="flex-1 text-white relative z-10 flex flex-col lg:max-w-[500px]">
            <div className="mb-2">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                {isRtl ? content.eyebrowAr : content.eyebrowEn}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold leading-tight mt-4 mb-6">
              {isRtl ? content.titleAr : content.titleEn}
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-10">
              {isRtl ? content.descriptionAr : content.descriptionEn}
            </p>
            {(isRtl ? content.supportingTextAr : content.supportingTextEn) ? (
              <p className="text-white/65 text-sm leading-relaxed mb-8 -mt-4">
                {isRtl ? content.supportingTextAr : content.supportingTextEn}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {content.statCards.map((stat) => (
                <div key={stat.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-2xl font-extrabold">{stat.value}</div>
                  <div className="text-white/70 text-xs mt-1">{isRtl ? stat.labelAr : stat.labelEn}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="flex-1 relative z-10 lg:max-w-[580px]">
            <Card className="rounded-3xl shadow-2xl border-0">
              <CardContent className="p-6 md:p-8">

                {/* Step progress */}
                <div className="mb-6">
                  <div className="flex items-center w-full mb-3">
                    <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 ${step >= 1 ? "bg-brand-blue text-white shadow-md" : "bg-slate-100 text-slate-400"}`}>1</div>
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${step > 1 ? "bg-brand-blue" : "bg-slate-100"}`} />
                    <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 ${step >= 2 ? "bg-brand-blue text-white shadow-md" : "bg-slate-100 text-slate-400"}`}>2</div>
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${step > 2 ? "bg-brand-blue" : "bg-slate-100"}`} />
                    <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 ${step >= 3 ? "bg-brand-blue text-white shadow-md" : "bg-slate-100 text-slate-400"}`}>3</div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isRtl ? `الخطوة ${step} من 3` : `Step ${step} of 3`} — {stepTitles[step - 1]}
                  </p>
                </div>

                {/* Booking Type Toggle */}
                <div className="bg-slate-100 rounded-2xl p-1.5 flex mb-6">
                  {[
                    { value: "single", label: t("booking.singleEvent") },
                    { value: "annual", label: t("booking.annualPartner") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => form.setValue("bookingType", opt.value as any)}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        form.watch("bookingType") === opt.value
                          ? "bg-white shadow-sm text-brand-blue"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">

                    <AnimatePresence mode="wait">

                      {/* STEP 1 */}
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -24 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          className="space-y-4 pt-5 pb-5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-800 font-bold text-sm">{t("booking.fullName")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={t("booking.fullName")} {...field} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-800 font-bold text-sm">{t("booking.email")}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="example@domain.com" {...field} className="bg-slate-50 border-slate-200 h-11 rounded-xl text-start" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <p className="text-sm font-bold text-slate-700 mb-3">{isRtl ? "المسمى الوظيفي / التخصص" : "Job Title / Specialization"}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-800 font-bold text-sm">{t("booking.phone")}</FormLabel>
                                    <FormControl>
                                      <div className="flex gap-2" dir="ltr">
                                        <Select value={countryCode} onValueChange={setCountryCode}>
                                          <SelectTrigger className="w-[85px] px-2 border border-slate-200 rounded-xl bg-slate-50 text-[11px] font-bold text-slate-600 h-11 focus:ring-2 focus:ring-brand-blue focus:outline-none">
                                            <SelectValue placeholder="Code" />
                                          </SelectTrigger>
                                          <SelectContent className="max-h-[160px] min-w-[100px]">
                                            {countryCodes.map((c) => (
                                              <SelectItem key={`${c.name}`} value={c.code} className="text-[11px] font-bold py-2">
                                                {c.name} {c.code}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <Input placeholder="5xxxxxxxx" {...field} className="flex-1 bg-slate-50 border-slate-200 h-11 rounded-xl" />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="jobTitle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-800 font-bold text-sm">{isRtl ? "المسمى الوظيفي أو التخصص" : "Job Title or Specialization"}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={isRtl ? "المسمى الوظيفي أو التخصص" : "Job Title or Specialization"} {...field} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                        </motion.div>
                      )}

                      {/* STEP 2 */}
                      {step === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -24 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          className="space-y-4 pt-5 pb-5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="eventName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-800 font-bold text-sm">{isRtl ? "اسم الفعالية" : "Event Name"}</FormLabel>
                                  <FormControl>
                                    <Input placeholder={isRtl ? "اسم المؤتمر أو المعرض" : "Conference / Exhibition Name"} {...field} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="eventType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-800 font-bold text-sm">{t("booking.eventType")}</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                        <SelectValue placeholder={t("booking.eventType")} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="conference">{t("booking.conference")}</SelectItem>
                                      <SelectItem value="exhibition">{t("booking.exhibition")}</SelectItem>
                                      <SelectItem value="both">{t("booking.both")}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <p className="text-sm font-bold text-slate-700 mb-3">{isRtl ? "بيانات العمل والحضور" : "Attendance Details"}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="expectedAttendance"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-800 font-bold text-sm">{t("booking.expectedAttendance")}</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="500" {...field} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="organization"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-800 font-bold text-sm">{isRtl ? "جهة العمل (اختياري)" : "Organization (Optional)"}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={isRtl ? "اسم جهة العمل" : "Company / Organization"} {...field} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                        </motion.div>
                      )}

                      {/* STEP 3 */}
                      {step === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -24 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          className="space-y-4 pt-5 pb-5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="eventDate"
                              render={({ field }) => (
                                <FormItem dir={isRtl ? "rtl" : "ltr"}>
                                  <FormLabel className="text-slate-800 font-bold text-sm">{isRtl ? "تاريخ الفعالية" : "Event Date"}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      {...field}
                                      className={`bg-slate-50 border-slate-200 h-11 rounded-xl w-full ${
                                        isRtl 
                                          ? "text-right pr-3 [direction:rtl] [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:mr-2" 
                                          : "text-left"
                                      }`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <FormLabel className="text-slate-800 font-bold text-sm">{isRtl ? "الموقع المقترح" : "Proposed Location"}</FormLabel>
                              <div className="grid grid-cols-2 gap-2" dir={isRtl ? "rtl" : "ltr"}>
                                <FormField
                                  control={form.control}
                                  name="country"
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select
                                        onValueChange={(value) => {
                                          field.onChange(value)
                                          const nextDialCode = countryDialCode(value)
                                          if (nextDialCode) setCountryCode(nextDialCode)
                                        }}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl text-[12px] px-2 shadow-none">
                                            <SelectValue placeholder={isRtl ? "الدولة" : "Country"} />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem key="pref-SA" value="SA" className="text-[12px] font-bold">
                                              {language === "ar" ? "المملكة العربية السعودية" : "Saudi Arabia"}
                                            </SelectItem>
                                            <SelectItem key="pref-EG" value="EG" className="text-[12px] font-bold">
                                              {language === "ar" ? "مصر" : "Egypt"}
                                            </SelectItem>
                                            <SelectItem key="pref-AE" value="AE" className="text-[12px] font-bold">
                                              {language === "ar" ? "الإمارات العربية المتحدة" : "United Arab Emirates"}
                                            </SelectItem>
                                            <div className="h-px bg-slate-100 my-1" />
                                            {countryOptions
                                              .filter((c) => !preferredCountryCodes.includes(c.value))
                                              .map((c) => (
                                                <SelectItem key={`country-${c.value}`} value={c.value} className="text-[12px]">
                                                  {c.label}
                                                </SelectItem>
                                              ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage className="text-[10px]" />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="location"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          placeholder={isRtl ? "اكتب المدينة" : "City Name"} 
                                          {...field} 
                                          className="bg-slate-50 border-slate-200 h-11 rounded-xl text-[12px] px-2" 
                                        />
                                      </FormControl>
                                      <FormMessage className="text-[10px]" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <p className="text-sm font-bold text-slate-700 mb-3">{isRtl ? "الخدمات الإضافية المطلوبة (اختيارية حسب الطلب)" : "Additional Services Required (Optional per request)"}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { id: "hotel", label: t("booking.hotelBooking") },
                                { id: "airport", label: t("booking.airportReception") },
                                { id: "trips", label: t("booking.entertainmentTrips") },
                              ].map((service) => (
                                <FormField
                                  key={service.id}
                                  control={form.control}
                                  name="services"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border border-slate-200 rounded-2xl bg-slate-50 rtl:space-x-reverse cursor-pointer hover:bg-slate-100 transition-all shadow-sm">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(service.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, service.id])
                                              : field.onChange(field.value?.filter((v) => v !== service.id))
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-[11px] font-bold text-slate-600 cursor-pointer leading-tight">
                                        {service.label}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </div>

                        </motion.div>
                      )}

                    </AnimatePresence>

                    {/* Error Message */}
                    {errorMessage && (
                      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                        <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center gap-3 pt-6">
                      {step > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={isSubmitting}
                          className="px-6 py-6 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 min-w-[100px]"
                        >
                          {isRtl ? content.backLabelAr : content.backLabelEn}
                        </Button>
                      )}

                      {step < 3 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={isSubmitting}
                          className="flex-1 py-6 text-sm md:text-base font-extrabold bg-[#121212] hover:bg-black text-white rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRtl ? content.nextLabelAr : content.nextLabelEn}
                          <ChevronsRight className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-6 text-sm md:text-base font-extrabold bg-brand-blue hover:bg-blue-700 text-white rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="inline-block animate-spin mr-2">⏳</span>
                              {isRtl ? content.sendingLabelAr : content.sendingLabelEn}
                            </>
                          ) : (
                            <>
                              {isRtl ? content.submitLabelAr : content.submitLabelEn}
                              <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">🔒</div>
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                  </form>
                </Form>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {showSuccess && bookingData && (
        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          data={bookingData}
          content={{
            title: isRtl ? content.successTitleAr : content.successTitleEn,
            description: isRtl ? content.successDescriptionAr : content.successDescriptionEn,
          }}
        />
      )}
    </section>
  )
}
