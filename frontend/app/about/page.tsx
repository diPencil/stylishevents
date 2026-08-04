"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, Linkedin, Mail, QrCode, Ticket, Users } from "lucide-react"
import { PublicPageFrame, PublicPageHero } from "@/components/public/page-building-blocks"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { DEFAULT_ABOUT_PAGE_SETTINGS, normalizeAboutPageSettings } from "@/lib/site-content-defaults"
import { cn } from "@/lib/utils"
import type { AboutCapabilityIcon, AboutPageSettings } from "@/types/platform"

const capabilityIcons = {
  calendar: CalendarDays,
  ticket: Ticket,
  qrCode: QrCode,
  mail: Mail,
  barChart: BarChart3,
  users: Users,
} satisfies Record<AboutCapabilityIcon, typeof CalendarDays>

function textPair(isRtl: boolean, en: string, ar: string) {
  return isRtl ? ar : en
}

function imageUrl(value?: string) {
  return value ? apiAssetUrl(value) : ""
}

function ImageFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center rounded-[28px] bg-white/70 text-center text-sm font-extrabold text-slate-400 ring-1 ring-slate-100">
      {label}
    </div>
  )
}

export default function AboutPage() {
  const { isRtl } = useLanguage()
  const [aboutPage, setAboutPage] = useState<AboutPageSettings>(() => DEFAULT_ABOUT_PAGE_SETTINGS)

  useEffect(() => {
    platformApi.getSiteContentSettings()
      .then((content) => setAboutPage(normalizeAboutPageSettings(content?.aboutPage)))
      .catch(() => setAboutPage(DEFAULT_ABOUT_PAGE_SETTINGS))
  }, [])

  const enabledCards = useMemo(() => aboutPage.ecosystem.cards.filter((card) => card.enabled).slice(0, 6), [aboutPage.ecosystem.cards])
  const enabledTeamMembers = useMemo(
    () => aboutPage.team.members.filter((member) => member.enabled && (member.nameEn || member.nameAr)).slice(0, 12),
    [aboutPage.team.members]
  )
  const overviewImages = aboutPage.overview.images.slice(0, 3)

  return (
    <PublicPageFrame>
      {aboutPage.hero.enabled && (
        <PublicPageHero
          title={textPair(isRtl, aboutPage.hero.titleEn, aboutPage.hero.titleAr)}
          description={textPair(isRtl, aboutPage.hero.descriptionEn, aboutPage.hero.descriptionAr)}
          backgroundImage={aboutPage.hero.imageUrl}
          imageAlt={textPair(isRtl, aboutPage.hero.imageAltEn, aboutPage.hero.imageAltAr)}
        />
      )}

      {aboutPage.overview.enabled && (
        <section className="bg-white px-4 py-16 sm:px-6 lg:py-24" dir={isRtl ? "rtl" : "ltr"}>
          <div className="container mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                  {textPair(isRtl, aboutPage.overview.eyebrowEn, aboutPage.overview.eyebrowAr)}
                </p>
                <h2 className="mt-4 text-2xl font-black leading-tight text-[#0f172a] md:text-4xl lg:text-5xl">
                  {textPair(isRtl, aboutPage.overview.headingEn, aboutPage.overview.headingAr)}
                </h2>
                <p className="mt-5 text-base font-medium leading-8 text-slate-600">
                  {textPair(isRtl, aboutPage.overview.descriptionEn, aboutPage.overview.descriptionAr)}
                </p>
                <div className="mt-7 grid gap-3">
                  {aboutPage.overview.valuePoints.slice(0, 3).map((point) => (
                    <div key={point.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm font-extrabold text-slate-700">{textPair(isRtl, point.textEn, point.textAr)}</span>
                    </div>
                  ))}
                </div>
                {aboutPage.overview.ctaEnabled && (
                  <Button asChild className="mt-8 h-12 rounded-full px-6 font-extrabold">
                    <Link href={aboutPage.overview.ctaUrl || "/upcoming-events"}>
                      {textPair(isRtl, aboutPage.overview.ctaLabelEn, aboutPage.overview.ctaLabelAr)}
                      <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="grid min-h-[520px] grid-cols-2 grid-rows-2 gap-4">
                {overviewImages.map((image, index) => {
                  const url = imageUrl(image.imageUrl)
                  return (
                    <div key={image.id} className={cn("overflow-hidden rounded-[30px] bg-slate-100 shadow-[0_18px_60px_rgba(15,23,42,0.08)]", index === 0 && "row-span-2")}>
                      {url ? (
                        <img src={url} alt={textPair(isRtl, image.altEn, image.altAr)} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                      ) : (
                        <ImageFallback label={isRtl ? "صورة" : "Image"} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {aboutPage.ecosystem.enabled && (
        <section className="px-4 py-16 sm:px-6 lg:py-24" dir={isRtl ? "rtl" : "ltr"}>
          <div className="container mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                {textPair(isRtl, aboutPage.ecosystem.eyebrowEn, aboutPage.ecosystem.eyebrowAr)}
              </p>
              <h2 className="mt-4 text-2xl font-black leading-tight text-[#0f172a] md:text-4xl lg:text-5xl">
                {textPair(isRtl, aboutPage.ecosystem.headingEn, aboutPage.ecosystem.headingAr)}
              </h2>
              <p className="mt-5 text-base font-medium leading-8 text-slate-600">
                {textPair(isRtl, aboutPage.ecosystem.descriptionEn, aboutPage.ecosystem.descriptionAr)}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {enabledCards.map((card) => {
                const Icon = capabilityIcons[card.icon] || CalendarDays
                return (
                  <article key={card.id} className="group rounded-[28px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.11)]">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-[#0f172a]">{textPair(isRtl, card.titleEn, card.titleAr)}</h3>
                    <p className="mt-3 text-sm font-medium leading-7 text-slate-500">{textPair(isRtl, card.descriptionEn, card.descriptionAr)}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {aboutPage.team.enabled && enabledTeamMembers.length > 0 && (
        <section className="bg-white px-4 py-16 sm:px-6 lg:py-24" dir={isRtl ? "rtl" : "ltr"}>
          <div className="container mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                {textPair(isRtl, aboutPage.team.eyebrowEn, aboutPage.team.eyebrowAr)}
              </p>
              <h2 className="mt-4 text-2xl font-black leading-tight text-[#0f172a] md:text-4xl lg:text-5xl">
                {textPair(isRtl, aboutPage.team.headingEn, aboutPage.team.headingAr)}
              </h2>
              <p className="mt-5 text-base font-medium leading-8 text-slate-600">
                {textPair(isRtl, aboutPage.team.descriptionEn, aboutPage.team.descriptionAr)}
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {enabledTeamMembers.map((member) => {
                const profileImage = imageUrl(member.imageUrl)
                const name = textPair(isRtl, member.nameEn, member.nameAr)
                const jobTitle = textPair(isRtl, member.jobTitleEn, member.jobTitleAr)
                const bio = textPair(isRtl, member.bioEn, member.bioAr)
                return (
                  <article key={member.id} className="overflow-hidden rounded-[28px] bg-slate-50 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
                    <div className="aspect-[4/3] bg-white">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={textPair(isRtl, member.imageAltEn || member.nameEn, member.imageAltAr || member.nameAr)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageFallback label={isRtl ? "صورة عضو الفريق" : "Team member image"} />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-black text-[#0f172a]">{name}</h3>
                      {jobTitle ? <p className="mt-2 text-sm font-extrabold text-primary">{jobTitle}</p> : null}
                      {bio ? <p className="mt-4 text-sm font-medium leading-7 text-slate-500">{bio}</p> : null}
                      {(member.linkedinUrl || member.email) && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {member.linkedinUrl ? (
                            <Link href={member.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-extrabold text-slate-700 shadow-sm">
                              <Linkedin className="h-4 w-4 text-primary" />
                              LinkedIn
                            </Link>
                          ) : null}
                          {member.email ? (
                            <Link href={`mailto:${member.email}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-extrabold text-slate-700 shadow-sm">
                              <Mail className="h-4 w-4 text-primary" />
                              {isRtl ? "البريد" : "Email"}
                            </Link>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {aboutPage.vision.enabled && (
        <section className="bg-white px-4 py-16 sm:px-6 lg:py-24" dir={isRtl ? "rtl" : "ltr"}>
          <div className="container mx-auto max-w-7xl">
            <div className="grid items-center gap-10 rounded-[36px] bg-[#0f172a] p-5 text-white shadow-[0_28px_90px_rgba(15,23,42,0.16)] md:p-8 lg:grid-cols-[0.92fr_1.08fr]">
              <div className={cn("overflow-hidden rounded-[28px]", isRtl && "lg:order-2")}>
                {imageUrl(aboutPage.vision.imageUrl) ? (
                  <img
                    src={imageUrl(aboutPage.vision.imageUrl)}
                    alt={textPair(isRtl, aboutPage.vision.imageAltEn, aboutPage.vision.imageAltAr)}
                    className="h-[320px] w-full object-cover lg:h-[480px]"
                  />
                ) : (
                  <ImageFallback label={isRtl ? "صورة الرؤية" : "Vision image"} />
                )}
              </div>
              <div className={cn("p-3 md:p-6", isRtl && "lg:order-1")}>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                  {textPair(isRtl, aboutPage.vision.eyebrowEn, aboutPage.vision.eyebrowAr)}
                </p>
                <h2 className="mt-4 text-2xl font-black leading-tight md:text-4xl lg:text-5xl">
                  {textPair(isRtl, aboutPage.vision.headingEn, aboutPage.vision.headingAr)}
                </h2>
                <p className="mt-5 text-base font-medium leading-8 text-white/70">
                  {textPair(isRtl, aboutPage.vision.descriptionEn, aboutPage.vision.descriptionAr)}
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {aboutPage.vision.principles.slice(0, 6).map((principle) => (
                    <div key={principle.id} className="rounded-2xl bg-white/8 p-4 text-sm font-extrabold text-white">
                      {textPair(isRtl, principle.textEn, principle.textAr)}
                    </div>
                  ))}
                </div>
                {aboutPage.vision.ctaEnabled && (
                  <Button asChild className="mt-8 h-12 rounded-full px-6 font-extrabold">
                    <Link href={aboutPage.vision.ctaUrl || "/upcoming-events"}>
                      {textPair(isRtl, aboutPage.vision.ctaLabelEn, aboutPage.vision.ctaLabelAr)}
                      <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </PublicPageFrame>
  )
}
