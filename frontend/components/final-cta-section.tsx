"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { AnimatedCtaButton } from "@/components/ui/animated-cta-button"
import { useLanguage } from "@/contexts/language-context"
import { DEFAULT_HOMEPAGE_FINAL_CTA } from "@/lib/site-content-defaults"
import type { HomepageFinalCtaSettings } from "@/types/platform"

export function FinalCtaSection({ settings }: { settings?: Partial<HomepageFinalCtaSettings> | null }) {
  const { isRtl } = useLanguage()
  const [remoteSettings, setRemoteSettings] = useState<Partial<HomepageFinalCtaSettings> | null>(settings || null)

  useEffect(() => {
    setRemoteSettings(settings || null)
  }, [settings])

  useEffect(() => {
    if (settings) return
    import("@/lib/platform-api").then(({ platformApi }) => {
      platformApi.getSiteContentSettings().then((data) => {
        setRemoteSettings(data?.homepageFinalCta || null)
      })
    })
  }, [settings])

  const content = { ...DEFAULT_HOMEPAGE_FINAL_CTA, ...(remoteSettings || {}) }

  if (!content.enabled) return null

  const handlePrimaryClick = () => {
    const url = content.primaryButtonUrl || "#booking-form"
    if (url.startsWith("#")) {
      document.querySelector(url)?.scrollIntoView({ behavior: "smooth" })
      return
    }
    if (content.primaryButtonOpenInNewTab) {
      window.open(url, "_blank", "noopener,noreferrer")
      return
    }
    window.location.href = url
  }

  return (
    <section className="relative bg-white pt-24 pb-12 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none select-none z-0">
        <div className="relative">
          <div className="text-[15vw] md:text-[25vw] font-black tracking-tighter uppercase italic whitespace-nowrap leading-none opacity-[0.03] text-slate-900">
            Stylish Events
          </div>
          <div className="absolute inset-0 text-[15vw] md:text-[25vw] font-black tracking-tighter uppercase italic whitespace-nowrap leading-none bg-gradient-to-b from-slate-200 to-transparent bg-clip-text text-transparent opacity-40">
            Stylish Events
          </div>
        </div>
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-4 py-1.5 mb-8 text-[11px] font-bold rounded-full bg-slate-50 border border-slate-100 text-slate-500"
          >
            <div className="w-4 h-4 rounded-full bg-brand-blue/10 flex items-center justify-center text-[10px]">*</div>
            {isRtl ? content.eyebrowAr : content.eyebrowEn}
          </motion.div>

          <h2 className={`text-2xl md:text-7xl ${isRtl ? "font-bold" : "font-extrabold"} tracking-tight text-slate-900 mb-8 leading-[1.2] md:leading-[1.1]`}>
            <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              {isRtl ? content.titleAr : content.titleEn}
              <span className="w-12 h-12 md:w-16 md:h-16 inline-flex items-center justify-center overflow-hidden shrink-0 align-middle">
                <DotLottieReact
                  src="https://lottie.host/638d4dd8-7e5c-4e60-9313-7ad6928d848f/2jWx4KmHKg.lottie"
                  loop
                  autoplay
                  className="w-full h-full scale-125"
                />
              </span>
            </span>
          </h2>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium mb-12">
            {isRtl ? content.descriptionAr : content.descriptionEn}
          </p>

          {content.primaryButtonEnabled ? (
            <AnimatedCtaButton onClick={handlePrimaryClick} className="w-full md:w-auto text-base">
              {isRtl ? content.primaryButtonLabelAr : content.primaryButtonLabelEn}
            </AnimatedCtaButton>
          ) : null}
        </div>
      </div>
    </section>
  )
}
