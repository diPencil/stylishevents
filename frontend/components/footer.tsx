"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { Instagram, Linkedin, Facebook, Youtube, Music2 } from "lucide-react"
import { AnimatedCtaButton } from "@/components/ui/animated-cta-button"
import { useEffect, useState } from "react"
import { apiAssetUrl } from "@/lib/platform-api"

const defaultSocialLinks = [
  { id: "s1", platform: "twitter", url: "https://twitter.com" },
  { id: "s2", platform: "instagram", url: "https://instagram.com" },
  { id: "s3", platform: "linkedin", url: "https://linkedin.com" },
]

const defaultFooterLinks = [
  { id: "1", col: "services", labelEn: "Conference Booking", labelAr: "حجز المؤتمرات", href: "#" },
  { id: "2", col: "services", labelEn: "Exhibition Management", labelAr: "تنظيم المعارض", href: "#" },
  { id: "3", col: "services", labelEn: "Hotel Reservations", labelAr: "حجوزات الفنادق", href: "#" },
  { id: "4", col: "services", labelEn: "Reception and Farewell", labelAr: "الاستقبال والتوديع", href: "#" },
  { id: "5", col: "support", labelEn: "FAQ", labelAr: "الأسئلة الشائعة", href: "#" },
  { id: "6", col: "support", labelEn: "Privacy Policy", labelAr: "سياسة الخصوصية", href: "#" },
  { id: "7", col: "support", labelEn: "Terms and Conditions", labelAr: "الشروط والأحكام", href: "#" },
  { id: "8", col: "support", labelEn: "Contact Us", labelAr: "تواصل معنا", href: "#" },
  { id: "9", col: "company", labelEn: "About Company", labelAr: "عن الشركة", href: "#" },
  { id: "10", col: "company", labelEn: "Partners", labelAr: "شركاء النجاح", href: "#" },
  { id: "11", col: "company", labelEn: "Media Center", labelAr: "المركز الإعلامي", href: "#" },
  { id: "12", col: "company", labelEn: "Careers", labelAr: "وظائف", href: "#" },
]

export function Footer() {
  const { t, isRtl } = useLanguage()
  const [siteContent, setSiteContent] = useState<any>(null)
  const [themeSettings, setThemeSettings] = useState<any>(null)

  useEffect(() => {
    import("@/lib/platform-api").then(({ platformApi }) => {
      platformApi.getSiteContentSettings().then((data) => {
        if (data) setSiteContent(data)
      })
      platformApi.getThemeSettings().then((data) => {
        if (data) setThemeSettings(data)
      })
    })
  }, [])

  return (
    <footer className="relative bg-white pt-24 pb-12 overflow-hidden">
      {/* Giant Watermark Background - Positioned behind all content */}
      <div className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none select-none z-0">
        <div className="relative">
          <div className="text-[15vw] md:text-[25vw] font-black tracking-tighter uppercase italic whitespace-nowrap leading-none opacity-[0.03] text-slate-900">
            {t("common.brand")} {t("common.brandSub")}
          </div>
          <div className="absolute inset-0 text-[15vw] md:text-[25vw] font-black tracking-tighter uppercase italic whitespace-nowrap leading-none bg-gradient-to-b from-slate-200 to-transparent bg-clip-text text-transparent opacity-40">
            {t("common.brand")} {t("common.brandSub")}
          </div>
        </div>
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        {/* Large CTA Section */}
        <div className="flex flex-col items-center text-center mb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-4 py-1.5 mb-8 text-[11px] font-bold rounded-full bg-slate-50 border border-slate-100 text-slate-500"
          >
            <div className="w-4 h-4 rounded-full bg-brand-blue/10 flex items-center justify-center text-[10px]">✨</div>
            {isRtl ? siteContent?.homepage?.footerEyebrowAr || "شريك في النجاح" : siteContent?.homepage?.footerEyebrowEn || "Partner for Your Success"}
          </motion.div>
          
          <h2 className={`text-2xl md:text-7xl ${isRtl ? 'font-bold' : 'font-extrabold'} tracking-tight text-slate-900 mb-8 leading-[1.2] md:leading-[1.1]`}>
            {isRtl ? siteContent?.homepage?.footerTitle1Ar || "أطلق العنان لقوة" : siteContent?.homepage?.footerTitle1En || "Unlock the Power of"} <br className="hidden md:block" />
            <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              {t("common.brand")}
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center overflow-hidden shrink-0">
                <DotLottieReact 
                  src="https://lottie.host/638d4dd8-7e5c-4e60-9313-7ad6928d848f/2jWx4KmHKg.lottie" 
                  loop 
                  autoplay 
                  className="w-full h-full scale-125" 
                />
              </div>
              {isRtl ? siteContent?.homepage?.footerTitle2Ar || "في فعاليتك القادمة" : siteContent?.homepage?.footerTitle2En || "for Your Next Event"}
            </span>
          </h2>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium mb-12">
            {isRtl ? siteContent?.homepage?.footerDescAr || "انضم إلى أكثر من 500 مؤسسة تثق بمنصتنا لتنظيم وإدارة أهم فعالياتها." : siteContent?.homepage?.footerDescEn || "Join over 500 organizations that trust our platform to organize and manage their most important events."}
          </p>

          <AnimatedCtaButton
            onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full md:w-auto text-base"
          >
            {isRtl ? siteContent?.homepage?.footerCtaAr || "ابدأ تنظيم فعاليتك" : siteContent?.homepage?.footerCtaEn || "Start Organizing Your Event"}
          </AnimatedCtaButton>
        </div>

        {/* Footer Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mt-20 pt-16 border-t border-slate-100 relative z-10">
          
          {/* Brand & Social Column */}
            <div className="lg:col-span-4 flex flex-col items-start text-start">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="relative overflow-hidden transition-all duration-300 h-10 w-36 md:h-12 md:w-44">
                  <img
                    src={isRtl ? (themeSettings?.logoArUrl ? apiAssetUrl(themeSettings.logoArUrl) : "/stylish-logo-ar.svg") : (themeSettings?.logoEnUrl ? apiAssetUrl(themeSettings.logoEnUrl) : "/stylish-logo.svg")}
                    alt={t("common.brand")}
                    className="h-full w-full object-contain object-left"
                  />
                </div>
              </Link>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed max-w-sm">
              {isRtl ? siteContent?.homepage?.footerLogoDescAr || "شريكك الاحترافي في تنظيم وإدارة المؤتمرات والمعارض والتذاكر والحضور والشهادات." : siteContent?.homepage?.footerLogoDescEn || "Your professional partner for conferences, exhibitions, tickets, attendance, and certificates."}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {(siteContent?.socialLinks || defaultSocialLinks).map((link: any, i: number) => {
                let icon = null
                switch (link.platform) {
                  case "twitter":
                    icon = (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )
                    break
                  case "instagram":
                    icon = <Instagram className="w-4 h-4" />
                    break
                  case "linkedin":
                    icon = <Linkedin className="w-4 h-4" />
                    break
                  case "facebook":
                    icon = <Facebook className="w-4 h-4" />
                    break
                  case "youtube":
                    icon = <Youtube className="w-4 h-4" />
                    break
                  case "tiktok":
                    icon = <Music2 className="w-4 h-4" />
                    break
                  default:
                    icon = <div className="w-4 h-4" />
                }
                
                return (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-blue hover:text-white transition-all shadow-sm">
                    {icon}
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-5">
              <h4 className="font-extrabold text-slate-900 mb-2">
                {isRtl ? siteContent?.homepage?.footerServicesTitleAr || "خدماتنا" : siteContent?.homepage?.footerServicesTitleEn || "Services"}
              </h4>
              {(siteContent?.footerLinks || defaultFooterLinks)?.filter((l: any) => l.col === "services").map((link: any, i: number) => (
                <Link key={i} href={link.href} className="text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors w-fit">
                  {isRtl ? link.labelAr : link.labelEn}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <h4 className="font-extrabold text-slate-900 mb-2">
                {isRtl ? siteContent?.homepage?.footerSupportTitleAr || "الدعم" : siteContent?.homepage?.footerSupportTitleEn || "Support"}
              </h4>
              {(siteContent?.footerLinks || defaultFooterLinks)?.filter((l: any) => l.col === "support").map((link: any, i: number) => (
                <Link key={i} href={link.href} className="text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors w-fit">
                  {isRtl ? link.labelAr : link.labelEn}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <h4 className="font-extrabold text-slate-900 mb-2">
                {isRtl ? siteContent?.homepage?.footerCompanyTitleAr || "الشركة" : siteContent?.homepage?.footerCompanyTitleEn || "Company"}
              </h4>
              {(siteContent?.footerLinks || defaultFooterLinks)?.filter((l: any) => l.col === "company").map((link: any, i: number) => (
                <Link key={i} href={link.href} className="text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors w-fit">
                  {isRtl ? link.labelAr : link.labelEn}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Minimal Copyright Bar */}
        <div className="relative mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-start">
            <p className="text-xs font-bold text-slate-400 tracking-widest">
              {isRtl 
                ? siteContent?.homepage?.footerCopyrightAr || `© ${new Date().getFullYear()} ${t("common.brand")} ${t("common.brandSub")}. جميع الحقوق محفوظة.`
                : siteContent?.homepage?.footerCopyrightEn || `© ${new Date().getFullYear()} ${t("common.brand")} ${t("common.brandSub")}. All rights reserved.`}
            </p>
            <span className="hidden md:inline text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">Powered by</span>
              <a href="https://dipencil.com/" target="_blank" rel="noreferrer" className="hover:opacity-75 transition-opacity flex items-center">
                <img src="https://panel.dipencil.com/pencil-logo.png" alt="Pencil Studio" className="h-4 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              </a>
            </div>
          </div>
          <div className="flex gap-6 relative z-10">
            <Link href="/terms" className="text-[10px] font-bold text-slate-400 hover:text-brand-blue uppercase tracking-widest transition-colors">{isRtl ? "الشروط والأحكام" : "Terms"}</Link>
            <Link href="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-brand-blue uppercase tracking-widest transition-colors">{isRtl ? "الخصوصية" : "Privacy"}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
