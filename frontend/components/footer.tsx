"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Music2, Phone, Youtube } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl } from "@/lib/platform-api"
import { defaultPlatformTheme } from "@/lib/platform-theme"
import { DEFAULT_FOOTER_LEGAL_LINKS, DEFAULT_FOOTER_LINKS, normalizeFooterLegalLinks, normalizeFooterLinks } from "@/lib/site-content-defaults"

const defaultSocialLinks = [
  { id: "s1", platform: "twitter", url: "https://twitter.com" },
  { id: "s2", platform: "instagram", url: "https://instagram.com" },
  { id: "s3", platform: "linkedin", url: "https://linkedin.com" },
]

function socialIcon(platform: string) {
  switch (platform) {
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case "instagram":
      return <Instagram className="h-4 w-4" />
    case "linkedin":
      return <Linkedin className="h-4 w-4" />
    case "facebook":
      return <Facebook className="h-4 w-4" />
    case "youtube":
      return <Youtube className="h-4 w-4" />
    case "tiktok":
      return <Music2 className="h-4 w-4" />
    default:
      return <div className="h-4 w-4" />
  }
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M16.03 3.2A12.76 12.76 0 0 0 3.26 15.96c0 2.25.6 4.44 1.73 6.37L3.15 29l6.83-1.79a12.73 12.73 0 0 0 6.05 1.54h.01A12.76 12.76 0 0 0 16.03 3.2Zm0 23.4h-.01c-1.9 0-3.76-.51-5.38-1.47l-.39-.23-4.05 1.06 1.08-3.95-.25-.41a10.58 10.58 0 0 1-1.62-5.64c0-5.85 4.76-10.61 10.63-10.61 2.84 0 5.51 1.11 7.52 3.12a10.55 10.55 0 0 1 3.11 7.51c0 5.86-4.77 10.62-10.64 10.62Zm5.83-7.94c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.58-1.59-.95-.85-1.6-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.68.77.24 1.47.21 2.02.13.62-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  )
}

function normalizePhoneHref(value?: string) {
  const compact = (value || "").replace(/[^\d+]/g, "")
  return compact ? `tel:${compact}` : ""
}

function normalizeWhatsappHref(value?: string) {
  const digits = (value || "").replace(/\D/g, "")
  return digits ? `https://wa.me/${digits}` : ""
}

function normalizeEmailHref(value?: string) {
  return value ? `mailto:${value}` : ""
}

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

  const contactCards = Array.isArray(siteContent?.contactPage?.contactCards) ? siteContent.contactPage.contactCards : []
  const phoneCard = contactCards.find((card: any) => card?.enabled !== false && (card?.id === "contact-phone" || card?.id === "phone" || card?.linkType === "phone"))
  const emailCard = contactCards.find((card: any) => card?.enabled !== false && (card?.id === "contact-email" || card?.id === "email" || card?.linkType === "email" || card?.icon === "mail"))
  const addressCard = contactCards.find((card: any) => card?.enabled !== false && (card?.id === "contact-address" || card?.id === "address" || card?.linkType === "map" || card?.icon === "mapPin"))
  const whatsappCard = contactCards.find((card: any) => card?.enabled !== false && (card?.id === "contact-support" || card?.id === "support" || card?.linkType === "whatsapp"))
  const footerLocation = addressCard?.value || (isRtl
    ? themeSettings?.footerLocationAr || themeSettings?.footerLocationEn || defaultPlatformTheme.footerLocationAr
    : themeSettings?.footerLocationEn || themeSettings?.footerLocationAr || defaultPlatformTheme.footerLocationEn)
  const footerMobile = phoneCard?.value || phoneCard?.linkValue || themeSettings?.footerMobile || defaultPlatformTheme.footerMobile
  const footerWhatsapp = whatsappCard?.linkValue || whatsappCard?.value || themeSettings?.footerWhatsapp || defaultPlatformTheme.footerWhatsapp
  const footerLocationHref = addressCard?.linkValue
  const contactEmail = useMemo(() => {
    return emailCard?.linkValue || emailCard?.value || "info@stylish-holidays.com"
  }, [emailCard])

  const footerLinks = useMemo(() => normalizeFooterLinks(siteContent?.footerLinks || DEFAULT_FOOTER_LINKS), [siteContent])
  const legalLinks = useMemo(() => normalizeFooterLegalLinks(siteContent?.footerLegalLinks || DEFAULT_FOOTER_LEGAL_LINKS, siteContent?.footerLinks), [siteContent])
  const linkGroups = [
    {
      key: "services",
      title: isRtl ? siteContent?.homepage?.footerServicesTitleAr || "\u062e\u062f\u0645\u0627\u062a\u0646\u0627" : siteContent?.homepage?.footerServicesTitleEn || "Services",
      links: footerLinks.filter((link) => link.col === "services"),
    },
    {
      key: "support",
      title: isRtl ? siteContent?.homepage?.footerSupportTitleAr || "\u0627\u0644\u062f\u0639\u0645" : siteContent?.homepage?.footerSupportTitleEn || "Support",
      links: footerLinks.filter((link) => link.col === "support"),
    },
  ]

  const contactItems = [
    {
      key: "phone",
      label: isRtl ? "\u0627\u0644\u0647\u0627\u062a\u0641" : "Phone",
      value: footerMobile,
      href: normalizePhoneHref(footerMobile),
      icon: <Phone className="h-4 w-4" />,
      ltr: true,
    },
    {
      key: "email",
      label: isRtl ? "\u0627\u0644\u0628\u0631\u064a\u062f" : "Email",
      value: contactEmail,
      href: normalizeEmailHref(contactEmail),
      icon: <Mail className="h-4 w-4" />,
      ltr: true,
    },
    {
      key: "location",
      label: isRtl ? "\u0627\u0644\u0645\u0648\u0642\u0639" : "Location",
      value: footerLocation,
      href: footerLocationHref,
      icon: <MapPin className="h-4 w-4" />,
      ltr: /[A-Za-z]/.test(footerLocation || ""),
      external: Boolean(footerLocationHref && /^https?:\/\//i.test(footerLocationHref)),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      value: footerWhatsapp,
      href: normalizeWhatsappHref(footerWhatsapp),
      icon: <WhatsAppIcon />,
      ltr: true,
      external: true,
      whatsapp: true,
    },
  ].filter((item) => item.value)

  return (
    <footer className="relative overflow-hidden bg-white pb-8 pt-14">
      <div className="pointer-events-none absolute inset-x-0 bottom-20 z-0 flex select-none justify-center">
        <div className="relative">
          <div className="whitespace-nowrap text-[18vw] font-black uppercase italic leading-none tracking-tighter text-slate-900 opacity-[0.018] md:text-[22vw]">
            {t("common.brand")} {t("common.brandSub")}
          </div>
          <div className="absolute inset-0 whitespace-nowrap bg-gradient-to-b from-slate-200 to-transparent bg-clip-text text-[18vw] font-black uppercase italic leading-none tracking-tighter text-transparent opacity-25 md:text-[22vw]">
            {t("common.brand")} {t("common.brandSub")}
          </div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid gap-10 border-t border-slate-100 pt-12 lg:grid-cols-[1.55fr_1.35fr_0.95fr] lg:gap-14">
          <div className="text-start">
            <Link href="/" className="mb-6 flex w-fit items-center">
              <div className="relative h-11 w-40 overflow-hidden md:h-12 md:w-44">
                <img
                  src={isRtl ? (themeSettings?.logoArUrl ? apiAssetUrl(themeSettings.logoArUrl) : "/LogoAR.png") : (themeSettings?.logoEnUrl ? apiAssetUrl(themeSettings.logoEnUrl) : "/logo.png")}
                  alt={t("common.brand")}
                  className="h-full w-full object-contain object-left rtl:object-right"
                />
              </div>
            </Link>
            <p className="max-w-sm text-sm font-semibold leading-7 text-slate-500 md:text-base">
              {isRtl
                ? siteContent?.homepage?.footerLogoDescAr || "\u0634\u0631\u064a\u0643\u0643 \u0627\u0644\u0627\u062d\u062a\u0631\u0627\u0641\u064a \u0644\u0644\u0645\u0624\u062a\u0645\u0631\u0627\u062a \u0648\u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0648\u0627\u0644\u062a\u0630\u0627\u0643\u0631 \u0648\u0627\u0644\u062d\u0636\u0648\u0631 \u0648\u0627\u0644\u0634\u0647\u0627\u062f\u0627\u062a."
                : siteContent?.homepage?.footerLogoDescEn || "Your professional partner for conferences, exhibitions, tickets, attendance, and certificates."}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {(siteContent?.socialLinks || defaultSocialLinks).map((link: any, i: number) => (
                <a
                  key={link.id || i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-100 transition-all hover:bg-[hsl(var(--primary))] hover:text-white"
                >
                  {socialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>

          <nav className="text-start" aria-label={isRtl ? "\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0641\u0648\u062a\u0631" : "Footer navigation"}>
            <div className="grid gap-8 sm:grid-cols-2">
              {linkGroups.map((group) => (
                <div key={group.key}>
                  <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-950">{group.title}</h3>
                  <div className="mt-5 flex flex-col gap-3">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="w-fit max-w-[13rem] text-sm font-bold leading-6 text-slate-500 transition-colors hover:text-[hsl(var(--primary))]"
                      >
                        {isRtl ? link.labelAr : link.labelEn}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="text-start">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-950">{isRtl ? "\u0627\u0644\u062a\u0648\u0627\u0635\u0644" : "Contact & Location"}</h3>
            <div className="mt-5 space-y-3">
              {contactItems.map((item) => {
                const content = (
                  <span className={`flex items-center gap-2.5 ${isRtl ? "text-right" : ""}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${item.whatsapp ? "bg-[#25D366]/10 text-[#25D366]" : "bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]"}`}>
                      {item.icon}
                    </span>
                    <span className="min-w-0 break-words text-xs font-medium leading-5 text-slate-600" dir={item.ltr ? "ltr" : undefined}>{item.value}</span>
                  </span>
                )

                return item.href ? (
                  <a
                    key={item.key}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="block transition-colors hover:text-[hsl(var(--primary))]"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.key}>
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-center md:flex-row md:text-start">
          <div className="flex flex-col items-center gap-3 md:flex-row">
            <p className="text-xs font-bold tracking-widest text-slate-400">
              {isRtl
                ? siteContent?.homepage?.footerCopyrightAr || `\u00a9 ${new Date().getFullYear()} ${t("common.brand")} ${t("common.brandSub")}. \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629.`
                : siteContent?.homepage?.footerCopyrightEn || `\u00a9 ${new Date().getFullYear()} ${t("common.brand")} ${t("common.brandSub")}. All rights reserved.`}
            </p>
            <span className="hidden text-slate-300 md:inline">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">Powered by</span>
              <a href="https://dipencil.com/" target="_blank" rel="noreferrer" className="flex items-center transition-opacity hover:opacity-75">
                <img src="https://panel.dipencil.com/pencil-logo.png" alt="Pencil Studio" className="h-4 w-auto object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0" />
              </a>
            </div>
          </div>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <Link key={link.id} href={link.href} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-[hsl(var(--primary))]">
                {isRtl ? link.labelAr : link.labelEn}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
