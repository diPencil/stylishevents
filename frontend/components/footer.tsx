"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { Instagram, Linkedin, Facebook, Youtube, Music2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiAssetUrl } from "@/lib/platform-api"

const defaultSocialLinks = [
  { id: "s1", platform: "twitter", url: "https://twitter.com" },
  { id: "s2", platform: "instagram", url: "https://instagram.com" },
  { id: "s3", platform: "linkedin", url: "https://linkedin.com" },
]

const defaultFooterLinks = [
  { id: "1", col: "services", labelEn: "Conference Booking", labelAr: "Ø­Ø¬Ø² Ø§Ù„Ù…Ø¤ØªÙ…Ø±Ø§Øª", href: "#" },
  { id: "2", col: "services", labelEn: "Exhibition Management", labelAr: "ØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø¹Ø§Ø±Ø¶", href: "#" },
  { id: "3", col: "services", labelEn: "Hotel Reservations", labelAr: "Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„ÙÙ†Ø§Ø¯Ù‚", href: "#" },
  { id: "4", col: "services", labelEn: "Reception and Farewell", labelAr: "Ø§Ù„Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ ÙˆØ§Ù„ØªÙˆØ¯ÙŠØ¹", href: "#" },
  { id: "5", col: "support", labelEn: "FAQ", labelAr: "Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©", href: "#" },
  { id: "6", col: "support", labelEn: "Privacy Policy", labelAr: "سياسة الخصوصية", href: "/privacy" },
  { id: "7", col: "support", labelEn: "Terms and Conditions", labelAr: "الشروط والأحكام", href: "/terms" },
  { id: "8", col: "support", labelEn: "Contact Us", labelAr: "تواصل معنا", href: "/contact" },
  { id: "9", col: "company", labelEn: "About Company", labelAr: "عن الشركة", href: "/about" },
  { id: "10", col: "company", labelEn: "Partners", labelAr: "Ø´Ø±ÙƒØ§Ø¡ Ø§Ù„Ù†Ø¬Ø§Ø­", href: "#" },
  { id: "11", col: "company", labelEn: "Media Center", labelAr: "Ø§Ù„Ù…Ø±ÙƒØ² Ø§Ù„Ø¥Ø¹Ù„Ø§Ù…ÙŠ", href: "#" },
  { id: "12", col: "company", labelEn: "Careers", labelAr: "ÙˆØ¸Ø§Ø¦Ù", href: "#" },
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

  const legalPages = siteContent?.legalPages || {}
  const termsEnabled = legalPages.terms?.enabled !== false
  const privacyEnabled = legalPages.privacy?.enabled !== false
  const normalizeFooterLink = (link: any) => {
    const label = `${link.labelEn || ""} ${link.labelAr || ""}`.toLowerCase()
    if (label.includes("privacy") || label.includes("خصوص")) return { ...link, href: "/privacy" }
    if (label.includes("terms") || label.includes("conditions") || label.includes("شروط")) return { ...link, href: "/terms" }
    return link
  }
  const footerLinks = (siteContent?.footerLinks || defaultFooterLinks)
    .map(normalizeFooterLink)
    .filter((link: any) => link.href !== "/why-us")
    .filter((link: any) => (link.href === "/terms" ? termsEnabled : true))
    .filter((link: any) => (link.href === "/privacy" ? privacyEnabled : true))

  return (
    <footer className="relative bg-white pt-12 pb-12 overflow-hidden">
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
        {/* Footer Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pt-16 border-t border-slate-100 relative z-10">
          
          {/* Brand & Social Column */}
            <div className="lg:col-span-4 flex flex-col items-start text-start">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="relative overflow-hidden transition-all duration-300 h-10 w-36 md:h-12 md:w-44">
                  <img
                    src={isRtl ? (themeSettings?.logoArUrl ? apiAssetUrl(themeSettings.logoArUrl) : "/LogoAR.png") : (themeSettings?.logoEnUrl ? apiAssetUrl(themeSettings.logoEnUrl) : "/logo.png")}
                    alt={t("common.brand")}
                    className="h-full w-full object-contain object-left"
                  />
                </div>
              </Link>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed max-w-sm">
              {isRtl ? siteContent?.homepage?.footerLogoDescAr || "Ø´Ø±ÙŠÙƒÙƒ Ø§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠ ÙÙŠ ØªÙ†Ø¸ÙŠÙ… ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø¤ØªÙ…Ø±Ø§Øª ÙˆØ§Ù„Ù…Ø¹Ø§Ø±Ø¶ ÙˆØ§Ù„ØªØ°Ø§ÙƒØ± ÙˆØ§Ù„Ø­Ø¶ÙˆØ± ÙˆØ§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª." : siteContent?.homepage?.footerLogoDescEn || "Your professional partner for conferences, exhibitions, tickets, attendance, and certificates."}
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
                {isRtl ? siteContent?.homepage?.footerServicesTitleAr || "Ø®Ø¯Ù…Ø§ØªÙ†Ø§" : siteContent?.homepage?.footerServicesTitleEn || "Services"}
              </h4>
              {footerLinks.filter((l: any) => l.col === "services").map((link: any, i: number) => (
                <Link key={i} href={link.href} className="text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors w-fit">
                  {isRtl ? link.labelAr : link.labelEn}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <h4 className="font-extrabold text-slate-900 mb-2">
                {isRtl ? siteContent?.homepage?.footerSupportTitleAr || "Ø§Ù„Ø¯Ø¹Ù…" : siteContent?.homepage?.footerSupportTitleEn || "Support"}
              </h4>
              {footerLinks.filter((l: any) => l.col === "support").map((link: any, i: number) => (
                <Link key={i} href={link.href} className="text-sm font-bold text-slate-500 hover:text-brand-blue transition-colors w-fit">
                  {isRtl ? link.labelAr : link.labelEn}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <h4 className="font-extrabold text-slate-900 mb-2">
                {isRtl ? siteContent?.homepage?.footerCompanyTitleAr || "Ø§Ù„Ø´Ø±ÙƒØ©" : siteContent?.homepage?.footerCompanyTitleEn || "Company"}
              </h4>
              {footerLinks.filter((l: any) => l.col === "company").map((link: any, i: number) => (
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
                ? siteContent?.homepage?.footerCopyrightAr || `Â© ${new Date().getFullYear()} ${t("common.brand")} ${t("common.brandSub")}. Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©.`
                : siteContent?.homepage?.footerCopyrightEn || `Â© ${new Date().getFullYear()} ${t("common.brand")} ${t("common.brandSub")}. All rights reserved.`}
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
            {termsEnabled ? <Link href="/terms" className="text-[10px] font-bold text-slate-400 hover:text-brand-blue uppercase tracking-widest transition-colors">{isRtl ? "الشروط والأحكام" : "Terms"}</Link> : null}
            {privacyEnabled ? <Link href="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-brand-blue uppercase tracking-widest transition-colors">{isRtl ? "الخصوصية" : "Privacy"}</Link> : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
