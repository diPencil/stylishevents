"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, ImageIcon } from "lucide-react"
import { DEFAULT_EVENTS_INSPIRE_SECTION } from "@/lib/site-content-defaults"
import { apiAssetUrl } from "@/lib/platform-api"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import type { HomepageGalleryImage, HomepageInspireSectionSettings } from "@/types/platform"

type EventsInspireSectionProps = {
  settings?: Partial<HomepageInspireSectionSettings> | null
}

const focalPositionClass: Record<HomepageGalleryImage["focalPosition"], string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
}

export function EventsInspireSection({ settings }: EventsInspireSectionProps) {
  const { isRtl } = useLanguage()
  const section = useMemo(() => normalizeInspireSection(settings), [settings])
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  if (!section.enabled) return null

  const title = isRtl ? section.titleAr : section.titleEn
  const eyebrow = isRtl ? section.eyebrowAr : section.eyebrowEn
  const description = isRtl ? section.descriptionAr : section.descriptionEn
  const ctaLabel = isRtl ? section.cta.labelAr : section.cta.labelEn
  const ctaTarget = section.cta.url || "/upcoming-events/"
  const externalCta = section.cta.linkType === "external"
  const safeExternal = externalCta && /^https?:\/\//i.test(ctaTarget)
  const normalizedCtaTarget = externalCta ? (safeExternal ? ctaTarget : "#") : normalizeInternalUrl(ctaTarget)

  return (
    <section id={section.anchorId || "events-that-inspire"} className="bg-slate-50/70 px-4 py-20 sm:px-6 lg:py-28">
      <div className="container mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-14">
          <div className={cn("max-w-xl", isRtl ? "text-right lg:order-2" : "text-left")}>
            {eyebrow ? (
              <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[hsl(var(--primary))] shadow-sm ring-1 ring-slate-100">
                {eyebrow}
              </span>
            ) : null}

            <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-[#0f172a] sm:text-5xl lg:text-6xl">
              {title}
            </h2>

            {section.showAccentLine ? (
              <div className={cn("mt-6 h-1.5 w-20 rounded-full bg-[hsl(var(--primary))]", isRtl && "mr-auto lg:mr-0")} />
            ) : null}

            {description ? (
              <p className="mt-6 text-base font-semibold leading-8 text-slate-600 sm:text-lg">{description}</p>
            ) : null}

            {section.timeline.enabled && section.timeline.items.length > 0 ? (
              <div className="mt-9">
                <div
                  className="hidden gap-4 md:grid"
                  style={{ gridTemplateColumns: `repeat(${Math.min(section.timeline.items.length, 6)}, minmax(0, 1fr))` }}
                >
                  {section.timeline.items.map((item, index) => (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      index={index}
                      total={section.timeline.items.length}
                      isRtl={isRtl}
                      desktop
                    />
                  ))}
                </div>
                <div className="grid gap-4 md:hidden">
                  {section.timeline.items.map((item, index) => (
                    <TimelineItem key={item.id} item={item} index={index} total={section.timeline.items.length} isRtl={isRtl} />
                  ))}
                </div>
              </div>
            ) : null}

            {section.cta.enabled && ctaLabel ? (
              <Link
                href={normalizedCtaTarget}
                target={externalCta && section.cta.openInNewTab && safeExternal ? "_blank" : undefined}
                rel={externalCta && section.cta.openInNewTab && safeExternal ? "noreferrer" : undefined}
                className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-7 text-sm font-extrabold text-white shadow-[0_16px_35px_hsl(var(--primary)/0.22)] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--primary)/0.90)]"
              >
                {ctaLabel}
                <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
              </Link>
            ) : null}
          </div>

          <div className={cn("grid min-h-[520px] grid-cols-2 grid-rows-[0.85fr_1fr] gap-4 sm:gap-5 lg:min-h-[620px]", isRtl && "lg:order-1")}>
            {section.gallery.slice(0, 4).map((image, index) => (
              <GalleryTile
                key={image.id}
                image={image}
                isRtl={isRtl}
                failed={!!failedImages[image.id]}
                onError={() => setFailedImages((current) => ({ ...current, [image.id]: true }))}
                className={galleryTileClass(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TimelineItem({
  item,
  index,
  total,
  isRtl,
  desktop = false,
}: {
  item: HomepageInspireSectionSettings["timeline"]["items"][number]
  index: number
  total: number
  isRtl: boolean
  desktop?: boolean
}) {
  const label = isRtl ? item.labelAr : item.labelEn
  const title = isRtl ? item.titleAr : item.titleEn
  const description = isRtl ? item.descriptionAr : item.descriptionEn

  return (
    <div className={cn("relative", desktop ? "pt-10" : "grid grid-cols-[42px_1fr] gap-4")}>
      {desktop ? (
        <>
          <div className="absolute left-0 right-0 top-4 h-px bg-slate-200" />
          {index === 0 ? <div className="absolute left-0 top-4 h-px w-1/2 bg-slate-50/70" /> : null}
          {index === total - 1 ? <div className="absolute right-0 top-4 h-px w-1/2 bg-slate-50/70" /> : null}
        </>
      ) : (
        <div className={cn("absolute bottom-0 top-0 w-px bg-slate-200", isRtl ? "right-[20px]" : "left-[20px]")} />
      )}
      <div className={cn("relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-black text-white shadow-lg", desktop && "mx-auto")}>
        {label}
      </div>
      <div className={cn(desktop ? "mt-4 text-center" : "pb-3", isRtl && !desktop && "text-right")}>
        <h3 className="text-sm font-black uppercase tracking-[0.04em] text-[#0f172a]">{title}</h3>
        {description ? <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{description}</p> : null}
      </div>
    </div>
  )
}

function GalleryTile({
  image,
  isRtl,
  failed,
  onError,
  className,
}: {
  image: HomepageGalleryImage
  isRtl: boolean
  failed: boolean
  onError: () => void
  className?: string
}) {
  const src = apiAssetUrl(image.imageUrl)
  const alt = isRtl ? image.altAr : image.altEn
  const shouldRenderImage = !!src && !failed

  return (
    <div className={cn("relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,hsl(var(--primary)/0.16),#ffffff_46%,hsl(var(--primary)/0.08))] shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-white", className)}>
      {shouldRenderImage ? (
        <img
          src={src}
          alt={alt || "Stylish Events gallery image"}
          loading="lazy"
          onError={onError}
          className={cn("h-full w-full object-cover", focalPositionClass[image.focalPosition] || "object-center")}
        />
      ) : (
        <div className="flex h-full min-h-[180px] w-full items-center justify-center bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),#fff_58%,hsl(var(--primary)/0.06))] text-[hsl(var(--primary))]">
          <ImageIcon className="h-8 w-8" aria-hidden="true" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.10))]" />
    </div>
  )
}

function galleryTileClass(index: number) {
  if (index === 0) return "row-span-1"
  if (index === 1) return "row-span-1 translate-y-6"
  if (index === 2) return "row-span-2"
  return "row-span-1 -translate-y-4"
}

function normalizeInternalUrl(url: string) {
  if (!url) return "/upcoming-events/"
  if (/^https?:\/\//i.test(url)) return "/upcoming-events/"
  return url.startsWith("/") ? url : `/${url}`
}

function normalizeInspireSection(settings?: Partial<HomepageInspireSectionSettings> | null): HomepageInspireSectionSettings {
  const saved = settings || {}
  return {
    ...DEFAULT_EVENTS_INSPIRE_SECTION,
    ...saved,
    timeline: {
      ...DEFAULT_EVENTS_INSPIRE_SECTION.timeline,
      ...(saved.timeline || {}),
      items: Array.isArray(saved.timeline?.items)
        ? saved.timeline.items.slice(0, 6)
        : DEFAULT_EVENTS_INSPIRE_SECTION.timeline.items,
    },
    cta: {
      ...DEFAULT_EVENTS_INSPIRE_SECTION.cta,
      ...(saved.cta || {}),
    },
    gallery: Array.isArray(saved.gallery) ? saved.gallery.slice(0, 4) : DEFAULT_EVENTS_INSPIRE_SECTION.gallery,
  }
}
