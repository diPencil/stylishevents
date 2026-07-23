"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { Ticket } from "lucide-react"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { useLanguage } from "@/contexts/language-context"
import { AnimatedCtaButton } from "@/components/ui/animated-cta-button"

type HeroSettings = {
  eyebrowEn: string
  eyebrowAr: string
  titleEn: string
  titleAr: string
  subtitleEn: string
  subtitleAr: string
  primaryCtaEn: string
  primaryCtaAr: string
  secondaryCtaEn: string
  secondaryCtaAr: string
  heroMediaType: "video" | "image"
  heroMediaUrl: string
}

const siteContentStorageKey = "stylish-events-site-content-settings"

const defaultHeroSettings: HeroSettings = {
  eyebrowEn: "Bringing your vision to life, one event at a time.",
  eyebrowAr: "منصة دايركت إيفنتس",
  titleEn: "Join Our Events",
  titleAr: "نظام احترافي لإدارة حجوزات وتذاكر وحضور الفعاليات",
  subtitleEn: "Create event pages, sell tickets by pricing periods, scan QR codes, and deliver certificates from one connected system.",
  subtitleAr: "أنشئ صفحات الفعاليات، بع التذاكر حسب الفترات السعرية، افحص رموز QR، وأرسل الشهادات من نظام واحد متكامل.",
  primaryCtaEn: "Register Your Event",
  primaryCtaAr: "سجل فعاليتك الآن",
  secondaryCtaEn: "Contact Us",
  secondaryCtaAr: "تواصل معنا",
  heroMediaType: "video",
  heroMediaUrl: "/eventsvideo-hero-section.mp4",
}

function normalizeHeroSettings(payload: any): HeroSettings {
  return { ...defaultHeroSettings, ...(payload?.homepage || payload || {}) }
}

function readSavedHeroSettings() {
  if (typeof window === "undefined") return defaultHeroSettings

  try {
    const saved = window.localStorage.getItem(siteContentStorageKey)
    return saved ? normalizeHeroSettings(JSON.parse(saved)) : defaultHeroSettings
  } catch {
    return defaultHeroSettings
  }
}

function splitTitle(title: string) {
  if (title.includes("*")) {
    const parts = title.split("*")
    return { first: parts[0].trim(), last: parts.slice(1).join("*").trim() }
  }
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 2) return { first: title, last: "" }
  return {
    first: words.slice(0, -2).join(" "),
    last: words.slice(-2).join(" "),
  }
}

function mediaMimeType(url: string) {
  if (/\.webm(\?.*)?$/i.test(url)) return "video/webm"
  if (/\.ogg(\?.*)?$/i.test(url)) return "video/ogg"
  return "video/mp4"
}

export function VideoHero() {
  const { isRtl } = useLanguage()
  const [settings, setSettings] = useState<HeroSettings>(defaultHeroSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSettings(readSavedHeroSettings())

    platformApi
      .getSiteContentSettings()
      .then((remote) => {
        const next = normalizeHeroSettings(remote)
        setSettings(next)
        window.localStorage.setItem(siteContentStorageKey, JSON.stringify({ ...(remote || {}), homepage: next }))
      })
      .catch(() => undefined)

    const syncSettings = () => setSettings(readSavedHeroSettings())
    window.addEventListener("stylish-events-site-content-settings-updated", syncSettings)
    return () => window.removeEventListener("stylish-events-site-content-settings-updated", syncSettings)
  }, [])

  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })
  }

  const mediaUrl = apiAssetUrl(settings.heroMediaUrl) || "/eventsvideo-hero-section.mp4"
  const title = isRtl ? settings.titleAr : settings.titleEn
  const eyebrow = isRtl ? settings.eyebrowAr : settings.eyebrowEn
  const subtitle = isRtl ? settings.subtitleAr : settings.subtitleEn
  const ctaLabel = isRtl ? settings.primaryCtaAr : settings.primaryCtaEn
  const secondaryCtaLabel = isRtl ? settings.secondaryCtaAr : settings.secondaryCtaEn
  const titleParts = useMemo(() => splitTitle(title), [title])

  if (!mounted) return null

  return (
    <section className="relative z-10 min-h-[760px] overflow-hidden flex flex-col items-center justify-center pt-20 pb-10 md:min-h-[840px] md:pt-24">
      <div className="absolute inset-0 -z-20 bg-[hsl(var(--primary)/0.08)]">
        {settings.heroMediaType === "image" ? (
          <img src={mediaUrl} alt="Stylish Events hero" className="h-full w-full object-cover" />
        ) : (
          <video key={mediaUrl} autoPlay muted loop playsInline preload="auto" className="h-full w-full object-cover">
            <source src={mediaUrl} type={mediaMimeType(mediaUrl)} />
          </video>
        )}
      </div>

      <div className="absolute inset-0 -z-10 bg-black/60" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_32%,hsl(var(--primary)/0.3),transparent_34%),radial-gradient(circle_at_82%_12%,hsl(var(--brand-purple)/0.2),transparent_26%)]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {eyebrow && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[12px] font-semibold text-slate-500 shadow-sm backdrop-blur md:mb-8"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]">
                <Ticket className="h-3 w-3 animate-pulse" />
              </span>
              <span>{eyebrow}</span>
            </motion.div>
          )}

          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-6 flex flex-col items-center text-center drop-shadow-md md:mb-8"
            >
              <p className="mb-5 max-w-4xl text-xl font-medium text-white sm:text-2xl md:text-3xl">
                {subtitle}
              </p>
              <div className="h-1 w-20 rounded-full bg-[hsl(var(--primary))] opacity-90" />
            </motion.div>
          )}

          {title && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`mb-8 max-w-4xl text-3xl leading-[1.0] tracking-tighter text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.85)] md:text-6xl lg:text-7xl ${isRtl ? "font-bold" : "font-extrabold"}`}
            >
              {titleParts.first}{" "}
              <span className="-mx-1 inline-flex h-14 w-14 items-center justify-center overflow-hidden align-middle md:-mx-2 md:h-20 md:w-20">
                <DotLottieReact src="https://lottie.host/0586338a-c54d-4c8e-b19c-4570477053a0/YvCHf5kV2P.lottie" loop autoplay className="h-14 w-14 md:h-20 md:w-20" />
              </span>
              {titleParts.last ? (
                <>
                  {" "}
                  {titleParts.last}
                </>
              ) : null}
            </motion.h1>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center gap-5 sm:flex-row"
          >
            {ctaLabel && (
              <AnimatedCtaButton onClick={scrollToForm}>
                {ctaLabel}
              </AnimatedCtaButton>
            )}
            
            {secondaryCtaLabel && (
              <button className="flex items-center justify-center rounded-full border-[2px] border-[hsl(var(--primary))] bg-transparent px-8 py-[8px] md:py-[10px] text-[0.85em] md:text-[1.1em] font-bold text-white transition-all hover:bg-[hsl(var(--primary))] hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                {secondaryCtaLabel}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
