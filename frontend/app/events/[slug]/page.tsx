"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, MessageSquareText, Star, Ticket, Users } from "lucide-react"
import { PublicPageFrame, PublicPageHero } from "@/components/public/page-building-blocks"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl, currentAuthToken, platformApi } from "@/lib/platform-api"
import { cn } from "@/lib/utils"

function formatDate(value?: string, locale = "en-US") {
  if (!value) return "-"
  return new Date(value).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })
}

function stateLabel(state: string, isRtl: boolean) {
  const labels: Record<string, { en: string; ar: string }> = {
    open: { en: "Registration open", ar: "التسجيل متاح" },
    opens_soon: { en: "Opens soon", ar: "يفتح قريبا" },
    closed: { en: "Registration closed", ar: "التسجيل مغلق" },
    sold_out: { en: "Sold out", ar: "مكتمل العدد" },
    ended: { en: "Ended", ar: "انتهت الفعالية" },
    cancelled: { en: "Unavailable", ar: "غير متاحة" },
    disabled: { en: "Registration unavailable", ar: "التسجيل غير متاح" },
  }
  return isRtl ? labels[state]?.ar || state : labels[state]?.en || state
}

export default function PublicEventPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug || ""
  const { isRtl } = useLanguage()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    if (!slug) return
    platformApi.getPublicEvent(slug)
      .then((result) => { if (active) setData(result) })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load event") })
    return () => { active = false }
  }, [slug])

  const event = data?.event
  const tickets = data?.tickets || []
  const locale = isRtl ? "ar-EG" : "en-US"
  const policy = event?.registration_policy || {}

  if (error) {
    return (
      <PublicPageFrame>
        <section className="px-4 py-40 text-center">
          <h1 className="text-3xl font-black text-slate-950">{isRtl ? "الفعالية غير متاحة" : "Event unavailable"}</h1>
          <p className="mt-3 font-semibold text-slate-500">{error}</p>
          <Button asChild className="mt-8 rounded-full px-6 font-black">
            <Link href="/upcoming-events">{isRtl ? "العودة للفعاليات" : "Back to events"}</Link>
          </Button>
        </section>
      </PublicPageFrame>
    )
  }

  if (!event) {
    return (
      <PublicPageFrame>
        <section className="px-4 py-40"><div className="mx-auto h-72 max-w-5xl animate-pulse rounded-[32px] bg-white/70" /></section>
      </PublicPageFrame>
    )
  }

  const heroImage = apiAssetUrl(event.banner_image_url || event.cover_image_url)
  const detailsImage = apiAssetUrl(event.event_details_image_url)
  const hasAvailableTicket = tickets.some((ticket: any) => ticket.price_period_id && !ticket.is_sold_out)
  const isLoginRequired = policy.access === "login_required"
  const canRegister = Boolean(policy.publicRegistrationEnabled !== false && event.state === "open" && hasAvailableTicket)
  const registerHref = isLoginRequired ? `/login?next=${encodeURIComponent(`/events/${event.slug}/register`)}` : `/events/${event.slug}/register`

  return (
    <PublicPageFrame>
      <PublicPageHero
        title={isRtl ? event.title_ar : event.title_en}
        description={isRtl ? event.summary_ar || "" : event.summary_en || ""}
        backgroundImage={heroImage}
        imageAlt={isRtl ? event.title_ar : event.title_en}
      />
      <section className="px-4 py-12 sm:px-6 lg:py-16" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {detailsImage ? (
              <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
                <img
                  src={detailsImage}
                  alt={isRtl ? event.title_ar : event.title_en}
                  className="aspect-[16/8] w-full object-cover"
                />
              </div>
            ) : null}

            <div className="rounded-[32px] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] md:p-8">
              <div className="flex flex-wrap gap-3">
                <Badge icon={Ticket} label={event.type} />
                <Badge icon={CheckCircle2} label={stateLabel(event.state, isRtl)} />
              </div>
              <h2 className="mt-7 text-2xl font-black text-slate-950 md:text-4xl lg:text-5xl">{isRtl ? "عن الفعالية" : "About this event"}</h2>
              <p className="mt-4 whitespace-pre-line text-base font-semibold leading-8 text-slate-600">
                {isRtl ? event.description_ar || event.summary_ar : event.description_en || event.summary_en}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Info icon={CalendarDays} label={isRtl ? "الموعد" : "Date"} value={formatDate(event.starts_at, locale)} />
              <Info icon={MapPin} label={isRtl ? "المكان" : "Location"} value={isRtl ? event.venue_name_ar || event.venue_city_ar || "Online" : event.venue_name_en || event.venue_city_en || "Online"} />
              <Info icon={Users} label={isRtl ? "السعة" : "Capacity"} value={event.max_attendees ? Number(event.max_attendees).toLocaleString(locale) : (isRtl ? "حسب التوفر" : "Subject to availability")} />
            </div>

            {data.sessions?.length ? (
              <div className="rounded-[32px] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
                <h2 className="text-2xl font-black text-slate-950">{isRtl ? "جدول الفعالية" : "Agenda"}</h2>
                <div className="mt-5 space-y-3">
                  {data.sessions.map((session: any) => (
                    <div key={session.id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-black text-primary">{formatDate(session.starts_at, locale)}</p>
                      <h3 className="mt-1 text-lg font-black text-slate-950">{isRtl ? session.title_ar : session.title_en}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{session.speaker_name || session.room_name || ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <ReviewsSection slug={slug} data={data} setData={setData} isRtl={isRtl} />
          </div>

          <aside className="lg:sticky lg:top-[116px] lg:self-start">
            <div className="rounded-[32px] bg-white p-5 shadow-[0_22px_70px_rgba(15,23,42,0.10)] lg:max-h-[calc(100vh-140px)] lg:overflow-hidden">
              <h2 className="text-2xl font-black text-slate-950">{isRtl ? "التذاكر المتاحة" : "Available tickets"}</h2>
              <div className="mt-5 space-y-3 lg:max-h-[calc(100vh-320px)] lg:overflow-y-auto lg:pr-1">
                {tickets.map((ticket: any) => {
                  const currency = isRtl ? "EGP" : "USD"
                  const price = currency === "EGP" ? ticket.price_egp ?? ticket.price : ticket.price_usd ?? ticket.price
                  return (
                    <div key={ticket.id} className={cn("rounded-2xl border p-4", ticket.is_sold_out || !ticket.price_period_id ? "border-slate-100 bg-slate-50 opacity-70" : "border-primary/15 bg-primary/5")}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black text-slate-950">{isRtl ? ticket.name_ar : ticket.name_en}</h3>
                          <p className="mt-1 text-xs font-bold text-slate-500">{isRtl ? ticket.price_label_ar : ticket.price_label_en}</p>
                        </div>
                        <p className="font-black text-primary" dir="ltr">{currency} {Number(price || 0).toLocaleString()}</p>
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{isRtl ? ticket.description_ar : ticket.description_en}</p>
                      <div className="mt-3 flex items-center justify-between text-xs font-black text-slate-500">
                        <span>{ticket.remaining == null ? (isRtl ? "متاح" : "Available") : `${ticket.remaining} ${isRtl ? "متبقي" : "left"}`}</span>
                        <span>{ticket.is_sold_out ? (isRtl ? "مكتمل" : "Sold out") : stateLabel(event.state, isRtl)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button asChild disabled={!canRegister} className="mt-5 h-12 w-full rounded-2xl bg-[hsl(var(--primary))] font-black text-white">
                <Link href={canRegister ? registerHref : "#"} aria-disabled={!canRegister}>
                  {canRegister ? (isLoginRequired ? (isRtl ? "سجل الدخول للتسجيل" : "Login to register") : (isRtl ? "سجل الآن" : "Register now")) : (isRtl ? "التسجيل غير متاح" : "Registration unavailable")}
                  <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </PublicPageFrame>
  )
}

function ReviewsSection({ slug, data, setData, isRtl }: { slug: string; data: any; setData: (data: any) => void; isRtl: boolean }) {
  const [eligibility, setEligibility] = useState<any>(null)
  const [loadingEligibility, setLoadingEligibility] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const summary = data?.event?.rating_summary || { average: 0, count: 0, distribution: {} }
  const reviews = data?.reviews || []
  const reviewStatus = eligibility?.review?.status

  useEffect(() => {
    let active = true
    const hasToken = Boolean(currentAuthToken())
    if (!slug || !hasToken) {
      setEligibility({ eligible: false, state: "login_required", reason: isRtl ? "سجل الدخول بعد حضور الفعالية لإضافة تقييمك." : "Log in after attending this event to leave a review." })
      return () => { active = false }
    }

    setLoadingEligibility(true)
    platformApi.getEventReviewEligibility(slug)
      .then((result) => {
        if (!active) return
        setEligibility(result)
        if (result.review) {
          setRating(Number(result.review.rating || 0))
          setComment(result.review.comment || "")
        }
      })
      .catch((err) => {
        if (active) setEligibility({ eligible: false, state: "unavailable", reason: err instanceof Error ? err.message : "Review is unavailable." })
      })
      .finally(() => { if (active) setLoadingEligibility(false) })
    return () => { active = false }
  }, [slug, isRtl])

  async function submitReview() {
    if (!rating) {
      setError(isRtl ? "اختار تقييم من 1 إلى 5." : "Choose a rating from 1 to 5.")
      return
    }
    setSubmitting(true)
    setError("")
    setNotice("")
    try {
      if (eligibility?.review) {
        await platformApi.updateEventReview(slug, { rating, comment })
      } else {
        await platformApi.submitEventReview(slug, { rating, comment })
      }
      const [freshEvent, freshEligibility] = await Promise.all([
        platformApi.getPublicEvent(slug),
        platformApi.getEventReviewEligibility(slug),
      ])
      setData(freshEvent)
      setEligibility(freshEligibility)
      setNotice(isRtl ? "تم إرسال تقييمك للمراجعة قبل النشر." : "Your review was sent for moderation before publishing.")
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRtl ? "تعذر إرسال التقييم." : "Could not submit review."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] md:p-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <Badge icon={Star} label={isRtl ? "تقييمات الحضور" : "Attendee reviews"} />
          <h2 className="mt-5 text-2xl font-black text-slate-950 md:text-4xl lg:text-5xl">{isRtl ? "آراء الحضور" : "Event reviews"}</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            {isRtl ? "تظهر هنا التقييمات المعتمدة فقط بعد مراجعة الإدارة." : "Only approved attendee reviews are shown here after admin moderation."}
          </p>
        </div>
        <div className="rounded-3xl bg-slate-50 px-5 py-4 text-center">
          <p className="text-3xl font-black text-primary" dir="ltr">{Number(summary.average || 0).toFixed(1)}</p>
          <div className="mt-1 flex justify-center gap-1 text-primary" aria-label={`${summary.average} stars`}>
            {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={cn("h-4 w-4", star <= Math.round(summary.average || 0) && "fill-current")} />)}
          </div>
          <p className="mt-1 text-xs font-black uppercase text-slate-400">{Number(summary.count || 0).toLocaleString()} {isRtl ? "تقييم" : "reviews"}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {reviews.length ? reviews.map((review: any) => (
            <div key={review.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-slate-950">{review.reviewer_name}</p>
                <div className="flex gap-1 text-primary" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={cn("h-4 w-4", star <= Number(review.rating || 0) && "fill-current")} />)}
                </div>
              </div>
              {review.comment ? <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{review.comment}</p> : null}
            </div>
          )) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-500">
              {isRtl ? "لا توجد تقييمات معتمدة لهذه الفعالية حتى الآن." : "No approved reviews for this event yet."}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <MessageSquareText className="h-5 w-5 text-primary" />
            {isRtl ? "أضف تقييمك" : "Leave your review"}
          </div>
          {loadingEligibility ? (
            <p className="mt-4 text-sm font-bold text-slate-500">{isRtl ? "جاري التحقق..." : "Checking eligibility..."}</p>
          ) : eligibility?.eligible ? (
            <div className="mt-4 space-y-4">
              <div className="flex gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="rounded-xl p-1 text-primary transition hover:bg-primary/10"
                    aria-label={`Rate ${star} stars`}
                    aria-pressed={star <= rating}
                  >
                    <Star className={cn("h-7 w-7", star <= rating && "fill-current")} />
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-500" aria-live="polite">
                {rating ? (isRtl ? `التقييم المختار ${rating} من 5` : `Selected rating ${rating} of 5`) : (isRtl ? "لم يتم اختيار تقييم بعد" : "No rating selected yet")}
              </p>
              {reviewStatus ? (
                <p className={cn("rounded-2xl px-3 py-2 text-xs font-black", reviewStatus === "approved" ? "bg-emerald-50 text-emerald-700" : reviewStatus === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")} aria-live="polite">
                  {reviewStatus === "approved"
                    ? (isRtl ? "تم نشر تقييمك." : "Your review is published.")
                    : reviewStatus === "rejected"
                      ? (isRtl ? "تم رفض تقييمك ويمكنك تحديثه وإرساله مرة أخرى." : "Your review was rejected; you can update and resubmit it.")
                      : (isRtl ? "تقييمك موجود وينتظر مراجعة الإدارة." : "Your review is saved and pending admin moderation.")}
                </p>
              ) : null}
              <label htmlFor="event-review-comment" className="text-xs font-black uppercase text-slate-500">
                {isRtl ? "تعليق التقييم" : "Review comment"}
              </label>
              <textarea
                id="event-review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={1200}
                aria-describedby="event-review-error event-review-status"
                className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-primary"
                placeholder={isRtl ? "اكتب تعليق مختصر عن تجربتك..." : "Write a short note about your experience..."}
              />
              {error ? <p id="event-review-error" className="text-xs font-bold text-red-600" aria-live="assertive">{error}</p> : null}
              {notice ? <p id="event-review-status" className="text-xs font-bold text-emerald-700" aria-live="polite">{notice}</p> : null}
              <Button type="button" onClick={submitReview} disabled={submitting} className="h-11 w-full rounded-2xl font-black">
                {submitting ? (isRtl ? "جاري الإرسال..." : "Submitting...") : eligibility.review ? (isRtl ? "تحديث التقييم" : "Update review") : (isRtl ? "إرسال التقييم" : "Submit review")}
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm font-bold leading-6 text-slate-500">{eligibility?.reason || (isRtl ? "التقييم متاح بعد حضور الفعالية." : "Reviews are available after attending the event.")}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Badge({ icon: Icon, label }: { icon: any; label: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black text-primary"><Icon className="h-4 w-4" />{label}</span>
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-4 text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-black leading-6 text-slate-950">{value}</p>
    </div>
  )
}
