"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Eye, Globe2, ImageIcon, Menu, Plus, Save, Search, Trash2, Video, type LucideIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { ImageUrlDropzone } from "@/components/admin/image-url-dropzone"
import { cn } from "@/lib/utils"
import { publicNavLinks } from "@/lib/public-pages-content"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { normalizeSiteContentSettings, DEFAULT_FEATURES_SECTION, DEFAULT_INFORMATION_SECTION_UPCOMING, DEFAULT_INFORMATION_SECTION_PREVIOUS, DEFAULT_EVENTS_INSPIRE_SECTION, DEFAULT_CONTACT_PAGE_SETTINGS, DEFAULT_HOMEPAGE_FINAL_CTA, DEFAULT_HOMEPAGE_REQUEST_SETUP, DEFAULT_ABOUT_PAGE_SETTINGS, DEFAULT_LEGAL_PAGES_SETTINGS } from "@/lib/site-content-defaults"
import type { EventInformationSectionSettings as TS_EventInformationSectionSettings, EventPageSettingsWithInfo as TS_EventPageSettings } from "@/types/platform"
import type { AboutCapabilityCard, AboutImageItem, AboutPageSettings, AboutPrincipleItem, AboutTeamMember, AboutValuePoint, ContactBenefitCardSettings, ContactInformationCardSettings, ContactPageSettings, FeaturesSectionHeaderSettings, HomepageFinalCtaSettings, HomepageGalleryImage, HomepageInspireSectionSettings, HomepageRequestSetupSettings, HomepageRequestSetupStatCard, HomepageTimelineItem, LegalContentSection, LegalPageSettings, LegalPagesSettings } from "@/types/platform"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"

type MenuItemSettings = {
  id: string
  labelEn: string
  labelAr: string
  href: string
  visible: boolean
}

export type WhyUsCard = {
  id: string
  titleEn: string
  titleAr: string
  descEn: string
  descAr: string
}

export type FaqItem = {
  id: string
  qEn: string
  qAr: string
  aEn: string
  aAr: string
}

export type FeatureCard = {
  id: string
  titleEn: string
  titleAr: string
  descEn: string
  descAr: string
}

// Use canonical types from frontend/types/platform.ts
type EventPageSettings = TS_EventPageSettings

type EventInformationSectionSettings = TS_EventInformationSectionSettings

export type FooterLink = {
  id: string
  col: "services" | "support" | "company"
  labelEn: string
  labelAr: string
  href: string
}

export type SocialLink = {
  id: string
  platform: "twitter" | "instagram" | "linkedin" | "facebook" | "youtube" | "tiktok"
  url: string
}

type SiteContentSettings = {
  homepage: {
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
    whyUsTitleEn: string
    whyUsTitleAr: string
    whyUsSubtitleEn: string
    whyUsSubtitleAr: string
    showcaseTitleEn: string
    showcaseTitleAr: string
    showcaseDescEn: string
    showcaseDescAr: string
    showcaseCtaEn: string
    showcaseCtaAr: string
    showcaseSortOrder: "latest" | "upcoming" | "default"
    faqEyebrowEn: string
    faqEyebrowAr: string
    faqTitleEn: string
    faqTitleAr: string
    faqSubtitleEn: string
    faqSubtitleAr: string
    faqWhatsappTextEn: string
    faqWhatsappTextAr: string
    faqWhatsappNumber: string
    faqWhatsappUrl?: string
    footerEyebrowEn: string
    footerEyebrowAr: string
    footerTitle1En: string
    footerTitle1Ar: string
    footerTitle2En: string
    footerTitle2Ar: string
    footerDescEn: string
    footerDescAr: string
    footerCtaEn: string
    footerCtaAr: string
    footerLogoDescEn: string
    footerLogoDescAr: string
    footerServicesTitleEn: string
    footerServicesTitleAr: string
    footerSupportTitleEn: string
    footerSupportTitleAr: string
    footerCompanyTitleEn: string
    footerCompanyTitleAr: string
    footerCopyrightEn: string
    footerCopyrightAr: string
    eventsInspireSection: HomepageInspireSectionSettings
  }
  whyUsCards: WhyUsCard[]
  faqs: FaqItem[]
  footerLinks: FooterLink[]
  socialLinks: SocialLink[]
  menu: MenuItemSettings[]
  seo: {
    metaTitle: string
    metaDescription: string
    canonicalUrl: string
    keywords: string
    ogImage: string
    robotsIndex: boolean
    robotsFollow: boolean
  }
  featuresCards: FeatureCard[]
  featuresSection: FeaturesSectionHeaderSettings
  homepageRequestSetup: HomepageRequestSetupSettings
  homepageFinalCta: HomepageFinalCtaSettings
  upcomingEvents?: EventPageSettings
  previousEvents?: EventPageSettings
  contactPage: ContactPageSettings
  aboutPage: AboutPageSettings
  legalPages: LegalPagesSettings
}

const storageKey = "stylish-events-site-content-settings"

type WebsiteContentPageTab = "homepage" | "about" | "contact" | "upcoming" | "previous" | "legal" | "footer" | "menu" | "seo"
type HomepageSectionTab = "hero" | "features" | "benefits" | "available-events" | "events-inspire" | "request-setup" | "faq" | "final-cta"
type AboutSectionTab = "hero" | "overview" | "ecosystem" | "team" | "vision"
type LegalSectionTab = "terms" | "privacy"

const websiteContentPageTabs: { value: WebsiteContentPageTab; labelEn: string; labelAr: string }[] = [
  { value: "homepage", labelEn: "Homepage", labelAr: "الصفحة الرئيسية" },
  { value: "about", labelEn: "About Page", labelAr: "صفحة عن المنصة" },
  { value: "contact", labelEn: "Contact Page", labelAr: "صفحة التواصل" },
  { value: "upcoming", labelEn: "Upcoming Events Page", labelAr: "صفحة الفعاليات القادمة" },
  { value: "previous", labelEn: "Previous Events Page", labelAr: "صفحة الفعاليات السابقة" },
  { value: "legal", labelEn: "Legal Pages", labelAr: "الصفحات القانونية" },
  { value: "footer", labelEn: "Footer", labelAr: "تذييل الموقع" },
  { value: "menu", labelEn: "Menu", labelAr: "القائمة" },
  { value: "seo", labelEn: "SEO", labelAr: "تحسين محركات البحث" },
]

const aboutSectionTabs: { value: AboutSectionTab; labelEn: string; labelAr: string }[] = [
  { value: "hero", labelEn: "Hero", labelAr: "Ø§Ù„Ù‡ÙŠØ±Ùˆ" },
  { value: "overview", labelEn: "Platform Overview", labelAr: "Ù†Ø¸Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØµØ©" },
  { value: "ecosystem", labelEn: "Event Ecosystem", labelAr: "Ù…Ù†Ø¸ÙˆÙ…Ø© Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª" },
  { value: "team", labelEn: "Team", labelAr: "Ø§Ù„ÙØ±ÙŠÙ‚" },
  { value: "vision", labelEn: "Vision & Principles", labelAr: "Ø§Ù„Ø±Ø¤ÙŠØ© ÙˆØ§Ù„Ù…Ø¨Ø§Ø¯Ø¦" },
]

const homepageSectionTabs: { value: HomepageSectionTab; labelEn: string; labelAr: string }[] = [
  { value: "hero", labelEn: "Hero", labelAr: "Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ" },
  { value: "features", labelEn: "Features", labelAr: "Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª" },
  { value: "benefits", labelEn: "Benefits (Why Us)", labelAr: "Ù„Ù…Ø§Ø°Ø§ Ù†Ø­Ù†" },
  { value: "available-events", labelEn: "Available Events", labelAr: "Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©" },
  { value: "events-inspire", labelEn: "Events That Inspire", labelAr: "ÙØ¹Ø§Ù„ÙŠØ§Øª ØªÙ„Ù‡Ù…" },
  { value: "request-setup", labelEn: "Request Setup", labelAr: "Ø·Ù„Ø¨ ØªØ¬Ù‡ÙŠØ² ÙØ¹Ø§Ù„ÙŠØ©" },
  { value: "faq", labelEn: "FAQ", labelAr: "Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©" },
  { value: "final-cta", labelEn: "Final CTA", labelAr: "Ø§Ù„Ø¯Ø¹ÙˆØ© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©" },
]

function hasCorruptedText(value: unknown): boolean {
  return typeof value === "string" && /(ÃƒÆ’|Ãƒâ€š|ÃƒËœ|Ãƒâ„¢|ÃƒÂ¢Ã¢â€šÂ¬|ÃƒÂ¯Ã‚Â¿Ã‚Â½|Ã¯Â¿Â½|ï¿½|\?{4,})/.test(value)
}

function hasCorruptedTree(value: unknown): boolean {
  if (hasCorruptedText(value)) return true
  if (Array.isArray(value)) return value.some(hasCorruptedTree)
  if (value && typeof value === "object") return Object.values(value).some(hasCorruptedTree)
  return false
}

const defaultSettings: SiteContentSettings = {
  homepage: {
    eyebrowEn: "Stylish Events Platform",
    eyebrowAr: "Ù…Ù†ØµØ© Stylish Events",
    titleEn: "Professional event booking, tickets, and attendance operations",
    titleAr: "Ù†Ø¸Ø§Ù… Ø§Ø­ØªØ±Ø§ÙÙŠ Ù„Ø¥Ø¯Ø§Ø±Ø© Ø­Ø¬ÙˆØ²Ø§Øª ÙˆØªØ°Ø§ÙƒØ± ÙˆØ­Ø¶ÙˆØ± Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª",
    subtitleEn: "Create event pages, sell tickets by pricing periods, scan QR codes, and deliver certificates from one connected system.",
    subtitleAr: "Ø£Ù†Ø´Ø¦ ØµÙØ­Ø§Øª Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§ØªØŒ Ø¨Ø¹ Ø§Ù„ØªØ°Ø§ÙƒØ± Ø­Ø³Ø¨ Ø§Ù„ÙØªØ±Ø§Øª Ø§Ù„Ø³Ø¹Ø±ÙŠØ©ØŒ Ø§ÙØ­Øµ Ø±Ù…ÙˆØ² QRØŒ ÙˆØ£Ø±Ø³Ù„ Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª Ù…Ù† Ù†Ø¸Ø§Ù… ÙˆØ§Ø­Ø¯ Ù…ØªÙƒØ§Ù…Ù„.",
    primaryCtaEn: "Book your event",
    primaryCtaAr: "Ø§Ø­Ø¬Ø² ÙØ¹Ø§Ù„ÙŠØªÙƒ",
    secondaryCtaEn: "Explore services",
    secondaryCtaAr: "Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ø®Ø¯Ù…Ø§Øª",
    heroMediaType: "video",
    heroMediaUrl: "/eventsvideo-hero-section.mp4",
    whyUsTitleEn: "Our experience makes your event easier to run",
    whyUsTitleAr: "Ø®Ø¨Ø±ØªÙ†Ø§ ØªØ¬Ø¹Ù„ ØªØ¬Ø±Ø¨Ø© ÙØ¹Ø§Ù„ÙŠØªÙƒ Ø£Ø³Ù‡Ù„ ÙˆØ£ÙƒØ«Ø± ØªÙ†Ø¸ÙŠÙ…Ø§",
    whyUsSubtitleEn: "We help teams manage the full event journey from registration to post-event certificates.",
    whyUsSubtitleAr: "Ù„Ø§ Ù†ÙƒØªÙÙŠ Ø¨Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø­Ø¬Ø² ÙÙ‚Ø·ØŒ Ø¨Ù„ Ù†ÙˆÙØ± ØªØ¬Ø±Ø¨Ø© ØªØ´ØºÙŠÙ„ ÙƒØ§Ù…Ù„Ø© Ù…Ù† Ù„Ø­Ø¸Ø© Ø§Ù„ØªØ³Ø¬ÙŠÙ„ ÙˆØ­ØªÙ‰ Ø¥ØµØ¯Ø§Ø± Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª Ø¨Ø¹Ø¯ Ø§Ù„Ø­Ø¶ÙˆØ±.",
    showcaseTitleEn: "Upcoming Events",
    showcaseTitleAr: "Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©",
    showcaseDescEn: "Browse and book our upcoming conferences and exhibitions",
    showcaseDescAr: "ØªØµÙØ­ ÙˆØ§Ø­Ø¬Ø² ÙÙŠ Ù…Ø¤ØªÙ…Ø±Ø§ØªÙ†Ø§ ÙˆÙ…Ø¹Ø§Ø±Ø¶Ù†Ø§ Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©",
    showcaseCtaEn: "View All Events",
    showcaseCtaAr: "Ø¹Ø±Ø¶ Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª",
    showcaseSortOrder: "default",
    faqEyebrowEn: "Frequently Asked Questions",
    faqEyebrowAr: "Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©",
    faqTitleEn: "Have questions? We have answers",
    faqTitleAr: "Ù„Ø¯ÙŠÙƒ Ø§Ø³ØªÙØ³Ø§Ø±ØŸ Ù„Ø¯ÙŠÙ†Ø§ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø©",
    faqSubtitleEn: "Everything you need to know about booking and managing events on our platform.",
    faqSubtitleAr: "ÙƒÙ„ Ù…Ø§ ØªØ­ØªØ§Ø¬ Ù…Ø¹Ø±ÙØªÙ‡ Ø¹Ù† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…Ù†ØµØªÙ†Ø§",
    faqWhatsappTextEn: "Chat with us on WhatsApp",
    faqWhatsappTextAr: "ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨",
    faqWhatsappNumber: "201012345678",
    footerEyebrowEn: "Partner for Your Success",
    footerEyebrowAr: "Ø´Ø±ÙŠÙƒ ÙÙŠ Ø§Ù„Ù†Ø¬Ø§Ø­",
    footerTitle1En: "Unlock the Power of",
    footerTitle1Ar: "Ø£Ø·Ù„Ù‚ Ø§Ù„Ø¹Ù†Ø§Ù† Ù„Ù‚ÙˆØ©",
    footerTitle2En: "for Your Next Event",
    footerTitle2Ar: "ÙÙŠ ÙØ¹Ø§Ù„ÙŠØªÙƒ Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©",
    footerDescEn: "Join over 500 organizations that trust our platform to organize and manage their most important events.",
    footerDescAr: "Ø§Ù†Ø¶Ù… Ø¥Ù„Ù‰ Ø£ÙƒØ«Ø± Ù…Ù† 500 Ù…Ø¤Ø³Ø³Ø© ØªØ«Ù‚ Ø¨Ù…Ù†ØµØªÙ†Ø§ Ù„ØªÙ†Ø¸ÙŠÙ… ÙˆØ¥Ø¯Ø§Ø±Ø© Ø£Ù‡Ù… ÙØ¹Ø§Ù„ÙŠØ§ØªÙ‡Ø§.",
    footerCtaEn: "Start Organizing Your Event",
    footerCtaAr: "Ø§Ø¨Ø¯Ø£ ØªÙ†Ø¸ÙŠÙ… ÙØ¹Ø§Ù„ÙŠØªÙƒ",
    footerLogoDescEn: "Your professional partner for conferences, exhibitions, tickets, attendance, and certificates.",
    footerLogoDescAr: "Ø´Ø±ÙŠÙƒÙƒ Ø§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠ ÙÙŠ ØªÙ†Ø¸ÙŠÙ… ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø¤ØªÙ…Ø±Ø§Øª ÙˆØ§Ù„Ù…Ø¹Ø§Ø±Ø¶ ÙˆØ§Ù„ØªØ°Ø§ÙƒØ± ÙˆØ§Ù„Ø­Ø¶ÙˆØ± ÙˆØ§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª.",
    footerServicesTitleEn: "Services",
    footerServicesTitleAr: "Ø®Ø¯Ù…Ø§ØªÙ†Ø§",
    footerSupportTitleEn: "Support",
    footerSupportTitleAr: "Ø§Ù„Ø¯Ø¹Ù…",
    footerCompanyTitleEn: "Company",
    footerCompanyTitleAr: "Ø§Ù„Ø´Ø±ÙƒØ©",
    footerCopyrightEn: "Â© 2026 Stylish Events. All rights reserved.",
    footerCopyrightAr: "Â© 2026 Stylish Events. Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©.",
    eventsInspireSection: DEFAULT_EVENTS_INSPIRE_SECTION,
  },
  featuresSection: DEFAULT_FEATURES_SECTION,
  homepageRequestSetup: DEFAULT_HOMEPAGE_REQUEST_SETUP,
  homepageFinalCta: DEFAULT_HOMEPAGE_FINAL_CTA,
  contactPage: DEFAULT_CONTACT_PAGE_SETTINGS,
  aboutPage: DEFAULT_ABOUT_PAGE_SETTINGS,
  legalPages: DEFAULT_LEGAL_PAGES_SETTINGS,
  upcomingEvents: {
    enabled: true,
    eyebrowEn: "",
    eyebrowAr: "",
    titleEn: "Upcoming Events",
    titleAr: "Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©",
    descriptionEn: "Discover upcoming events ready for registration.",
    descriptionAr: "Ø§ÙƒØªØ´Ù Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© Ø§Ù„Ù…ØªØ§Ø­Ø© Ù„Ù„ØªØ³Ø¬ÙŠÙ„.",
    emptyTitleEn: "No upcoming events",
    emptyTitleAr: "Ù„Ø§ ØªÙˆØ¬Ø¯ ÙØ¹Ø§Ù„ÙŠØ§Øª Ù‚Ø§Ø¯Ù…Ø©",
    emptyDescriptionEn: "There are no upcoming events at the moment.",
    emptyDescriptionAr: "Ù„Ø§ ØªÙˆØ¬Ø¯ ÙØ¹Ø§Ù„ÙŠØ§Øª Ù‚Ø§Ø¯Ù…Ø© ÙÙŠ Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ø­Ø§Ù„ÙŠ.",
    sortMode: 'default',
    itemsPerPage: 24,
    informationSection: DEFAULT_INFORMATION_SECTION_UPCOMING,
  },
  previousEvents: {
    enabled: true,
    eyebrowEn: "",
    eyebrowAr: "",
    titleEn: "Previous Events",
    titleAr: "Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©",
    descriptionEn: "Browse past events and archives.",
    descriptionAr: "ØªØµÙØ­ Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© ÙˆØ§Ù„Ø£Ø±Ø´ÙŠÙ.",
    emptyTitleEn: "No previous events",
    emptyTitleAr: "Ù„Ø§ ØªÙˆØ¬Ø¯ ÙØ¹Ø§Ù„ÙŠØ§Øª Ø³Ø§Ø¨Ù‚Ø©",
    emptyDescriptionEn: "There are no previous events available.",
    emptyDescriptionAr: "Ù„Ø§ ØªÙˆØ¬Ø¯ ÙØ¹Ø§Ù„ÙŠØ§Øª Ø³Ø§Ø¨Ù‚Ø© Ù…ØªØ§Ø­Ø©.",
    sortMode: 'nearest',
    itemsPerPage: 24,
    informationSection: DEFAULT_INFORMATION_SECTION_PREVIOUS,
  },
  whyUsCards: [
    {
      id: "card-1",
      titleEn: "Complete Event Operations",
      titleAr: "Ø¥Ø¯Ø§Ø±Ø© ÙØ¹Ø§Ù„ÙŠØ© Ù…ØªÙƒØ§Ù…Ù„Ø©",
      descEn: "Create event pages, manage tickets, pricing windows, and registrations from one workspace.",
      descAr: "Ø¥Ù†Ø´Ø§Ø¡ ØµÙØ­Ø§Øª Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§ØªØŒ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ØªØ°Ø§ÙƒØ±ØŒ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ø³Ø¹Ø§Ø±ØŒ ÙˆÙ…ØªØ§Ø¨Ø¹Ø© Ø§Ù„ØªØ³Ø¬ÙŠÙ„Ø§Øª Ù…Ù† Ù„ÙˆØ­Ø© ÙˆØ§Ø­Ø¯Ø©.",
    },
    {
      id: "card-2",
      titleEn: "Digital Tickets and QR",
      titleAr: "ØªØ°Ø§ÙƒØ± ÙˆQR Ø¬Ø§Ù‡Ø²Ø©",
      descEn: "Every confirmed booking can generate a ticket and QR code for event-day validation.",
      descAr: "ÙƒÙ„ Ø­Ø¬Ø² Ù…Ø¤ÙƒØ¯ ÙŠÙ†ØªØ¬ Ø¹Ù†Ù‡ ØªØ°ÙƒØ±Ø© Ø±Ù‚Ù…ÙŠØ© ÙˆØ±Ù…Ø² QR Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªØ­Ù‚Ù‚ ÙŠÙˆÙ… Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ©.",
    },
    {
      id: "card-3",
      titleEn: "Live Attendance Tracking",
      titleAr: "Ù…ØªØ§Ø¨Ø¹Ø© Ø­Ø¶ÙˆØ± Ù…Ø¨Ø§Ø´Ø±Ø©",
      descEn: "Check attendees in, prevent duplicate scans, and monitor event-day flow in real time.",
      descAr: "ØªØ³Ø¬ÙŠÙ„ Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø­Ø¶ÙˆØ± Ù„Ø­Ø¸ÙŠØ§ ÙˆÙ…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø± Ø£Ùˆ Ø§Ø³ØªØ®Ø¯Ø§Ù… QR ØºÙŠØ± ØµØ§Ù„Ø­.",
    },
  ],
  featuresCards: [
    { id: 'f-1', titleEn: 'Conference Management', titleAr: 'Ø¥Ø¯Ø§Ø±Ø© ÙˆØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø¤ØªÙ…Ø±Ø§Øª', descEn: 'Integrated system for attendance registration and session management with ease.', descAr: 'Ù†Ø¸Ø§Ù… Ù…ØªÙƒØ§Ù…Ù„ Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø­Ø¶ÙˆØ± ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ø¨ÙƒÙ„ Ø³Ù‡ÙˆÙ„Ø© ÙˆØ§Ø­ØªØ±Ø§ÙÙŠØ©.' },
    { id: 'f-2', titleEn: 'Smart Booking Strategies', titleAr: 'Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ§Øª Ø§Ù„Ø­Ø¬Ø² Ø§Ù„Ø°ÙƒÙŠ', descEn: 'Convert visitors into participants through flexible and easy-to-use booking systems.', descAr: 'Ø­ÙˆÙ‘Ù„ Ø§Ù„Ø²ÙˆØ§Ø± Ø¥Ù„Ù‰ Ù…Ø´Ø§Ø±ÙƒÙŠÙ† Ù…Ù† Ø®Ù„Ø§Ù„ Ø£Ù†Ø¸Ù…Ø© Ø­Ø¬Ø² Ù…Ø±Ù†Ø© ÙˆØ³Ù‡Ù„Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù….' },
    { id: 'f-3', titleEn: 'Immediate Support', titleAr: 'Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø© Ø§Ù„ÙÙˆØ±ÙŠØ©', descEn: 'A dedicated support team working around the clock to ensure a perfect guest experience.', descAr: 'ÙØ±ÙŠÙ‚ Ø¯Ø¹Ù… Ù…ØªØ®ØµØµ ÙŠØ¹Ù…Ù„ Ø¹Ù„Ù‰ Ù…Ø¯Ø§Ø± Ø§Ù„Ø³Ø§Ø¹Ø© Ù„Ø¶Ù…Ø§Ù† ØªØ¬Ø±Ø¨Ø© Ù…Ø«Ø§Ù„ÙŠØ© Ù„Ø¶ÙŠÙˆÙÙƒ.' },
  ],
  faqs: [
    { id: "faq-1", qEn: "How do I sign up?", qAr: "ÙƒÙŠÙ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ØŸ", aEn: "You can easily sign up by clicking the Book Now button and filling in the required information.", aAr: "ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ø¨Ø³Ù‡ÙˆÙ„Ø© Ù…Ù† Ø®Ù„Ø§Ù„ Ø§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ Ø²Ø± Ø§Ø·Ù„Ø¨ Ø­Ø¬Ø²Ùƒ ÙˆÙ…Ù„Ø¡ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©." },
    { id: "faq-2", qEn: "What makes us different?", qAr: "Ù…Ø§ Ø§Ù„Ø°ÙŠ ÙŠÙ…ÙŠØ²Ù†Ø§ Ø¹Ù† Ø§Ù„Ø¢Ø®Ø±ÙŠÙ†ØŸ", aEn: "We provide an integrated solution for event management with a focus on user experience and high professionalism.", aAr: "Ù†Ø­Ù† Ù†Ù‚Ø¯Ù… Ø­Ù„Ø§Ù‹ Ù…ØªÙƒØ§Ù…Ù„Ø§Ù‹ Ù„Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ù…Ø¹ Ø§Ù„ØªØ±ÙƒÙŠØ² Ø¹Ù„Ù‰ ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆØ§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ø§Ù„Ø¹Ø§Ù„ÙŠØ©." },
    { id: "faq-3", qEn: "How much does it cost?", qAr: "Ù…Ø§ Ù‡ÙŠ ØªÙƒÙ„ÙØ© Ø§Ù„Ø®Ø¯Ù…Ø§ØªØŸ", aEn: "Cost varies based on the type of event and services required. You can request a custom quote.", aAr: "ØªØ®ØªÙ„Ù Ø§Ù„ØªÙƒÙ„ÙØ© Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ù†ÙˆØ¹ Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ© ÙˆØ§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©. ÙŠÙ…ÙƒÙ†Ùƒ Ø·Ù„Ø¨ Ø¹Ø±Ø¶ Ø³Ø¹Ø± Ù…Ø®ØµØµ." },
    { id: "faq-4", qEn: "How long does it take to design a website?", qAr: "ÙƒÙ… ÙŠØ³ØªØºØ±Ù‚ ØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø¹Ø±Ø¶ØŸ", aEn: "Time depends on the size and requirements of the exhibition, usually taking two weeks to a month.", aAr: "ÙŠØ¹ØªÙ…Ø¯ Ø§Ù„ÙˆÙ‚Øª Ø¹Ù„Ù‰ Ø­Ø¬Ù… Ø§Ù„Ù…Ø¹Ø±Ø¶ ÙˆÙ…ØªØ·Ù„Ø¨Ø§ØªÙ‡ØŒ ÙˆØ¹Ø§Ø¯Ø© Ù…Ø§ ÙŠØ³ØªØºØ±Ù‚ Ù…Ù† Ø£Ø³Ø¨ÙˆØ¹ÙŠÙ† Ø¥Ù„Ù‰ Ø´Ù‡Ø±." },
    { id: "faq-5", qEn: "What verticals/niches are supported?", qAr: "Ù‡Ù„ Ù†Ø¯Ø¹Ù… Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ø§Ù„Ø¯ÙˆÙ„ÙŠØ©ØŸ", aEn: "Yes, we support organizing events and conferences on both international and local levels.", aAr: "Ù†Ø¹Ù…ØŒ Ù†Ø­Ù† Ù†Ø¯Ø¹Ù… ØªÙ†Ø¸ÙŠÙ… Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª ÙˆØ§Ù„Ù…Ø¤ØªÙ…Ø±Ø§Øª Ø¹Ù„Ù‰ Ù…Ø³ØªÙˆÙ‰ Ø¯ÙˆÙ„ÙŠ ÙˆÙ…Ø­Ù„ÙŠ." },
    { id: "faq-6", qEn: "Is it compliant and secure?", qAr: "Ù‡Ù„ Ø§Ù„Ù†Ø¸Ø§Ù… Ø¢Ù…Ù† ÙˆÙ…ØªÙˆØ§ÙÙ‚ØŸ", aEn: "Yes, we use the latest security standards to protect your data and participant data.", aAr: "Ù†Ø¹Ù…ØŒ Ù†Ø³ØªØ®Ø¯Ù… Ø£Ø­Ø¯Ø« Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø£Ù…Ø§Ù† Ù„Ø­Ù…Ø§ÙŠØ© Ø¨ÙŠØ§Ù†Ø§ØªÙƒ ÙˆØ¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†." },
    { id: "faq-7", qEn: "How does it work with my business?", qAr: "ÙƒÙŠÙ ÙŠØ¹Ù…Ù„ Ø§Ù„Ù†Ø¸Ø§Ù… Ù…Ø¹ Ù†Ø´Ø§Ø·ÙŠØŸ", aEn: "Our system is flexible and can be customized to fit the needs of any business sector or event type.", aAr: "Ù†Ø¸Ø§Ù…Ù†Ø§ Ù…Ø±Ù† ÙˆÙŠÙ…ÙƒÙ† ØªØ®ØµÙŠØµÙ‡ Ù„ÙŠØªÙ†Ø§Ø³Ø¨ Ù…Ø¹ Ø§Ø­ØªÙŠØ§Ø¬Ø§Øª Ø£ÙŠ Ù‚Ø·Ø§Ø¹ Ø£Ø¹Ù…Ø§Ù„ Ø£Ùˆ Ù†ÙˆØ¹ ÙØ¹Ø§Ù„ÙŠØ©." },
    { id: "faq-8", qEn: "What if my competitor is using us?", qAr: "Ù…Ø§Ø°Ø§ Ù„Ùˆ Ù„Ù… ÙŠØ¹Ø¬Ø¨Ù†ÙŠ Ø§Ù„ØªØµÙ…ÙŠÙ…ØŸ", aEn: "We work with you step-by-step to ensure your complete satisfaction with all aspects of organization and design.", aAr: "Ù†Ø¹Ù…Ù„ Ù…Ø¹Ùƒ Ø®Ø·ÙˆØ© Ø¨Ø®Ø·ÙˆØ© Ù„Ø¶Ù…Ø§Ù† Ø±Ø¶Ø§Ùƒ Ø§Ù„ØªØ§Ù… Ø¹Ù† Ø¬Ù…ÙŠØ¹ Ø¬ÙˆØ§Ù†Ø¨ Ø§Ù„ØªÙ†Ø¸ÙŠÙ… ÙˆØ§Ù„ØªØµÙ…ÙŠÙ…." },
    { id: "faq-9", qEn: "What if I don't like the designs or strategies?", qAr: "Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ø§Ø®ØªÙŠØ§Ø± Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ© Ù…Ø¹ÙŠÙ†Ø©ØŸ", aEn: "Certainly, our consulting team will help you choose the best strategies for your event.", aAr: "Ø¨Ø§Ù„ØªØ£ÙƒÙŠØ¯ØŒ ÙØ±ÙŠÙ‚Ù†Ø§ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±ÙŠ Ø³ÙŠØ³Ø§Ø¹Ø¯Ùƒ ÙÙŠ Ø§Ø®ØªÙŠØ§Ø± Ø£ÙØ¶Ù„ Ø§Ù„Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ§Øª Ù„ÙØ¹Ø§Ù„ÙŠØªÙƒ." },
    { id: "faq-10", qEn: "I can do this myself, why do I need you?", qAr: "Ù„Ù…Ø§Ø°Ø§ Ø£Ø­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ø®Ø¯Ù…Ø§ØªÙƒÙ…ØŸ", aEn: "We save you time and effort and guarantee high professionalism and tangible results for your event.", aAr: "Ù†Ø­Ù† Ù†ÙˆÙØ± Ø¹Ù„ÙŠÙƒ Ø§Ù„ÙˆÙ‚Øª ÙˆØ§Ù„Ø¬Ù‡Ø¯ ÙˆÙ†Ø¶Ù…Ù† Ù„Ùƒ Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ø¹Ø§Ù„ÙŠØ© ÙˆÙ†ØªØ§Ø¦Ø¬ Ù…Ù„Ù…ÙˆØ³Ø© Ù„ÙØ¹Ø§Ù„ÙŠØªÙƒ." },
    { id: "faq-11", qEn: "How do we start working with you?", qAr: "ÙƒÙŠÙ Ù†Ø¨Ø¯Ø£ Ø§Ù„Ø¹Ù…Ù„ Ù…Ø¹ÙƒÙ…ØŸ", aEn: "You can start by filling out the booking request form, and our team will contact you within 24 hours to discuss all details and needs.", aAr: "ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¨Ø¯Ø¡ Ø¨Ù…Ù„Ø¡ Ù†Ù…ÙˆØ°Ø¬ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø¬Ø²ØŒ ÙˆØ³ÙŠÙ‚ÙˆÙ… ÙØ±ÙŠÙ‚Ù†Ø§ Ø¨Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ø®Ù„Ø§Ù„ 24 Ø³Ø§Ø¹Ø© Ù„Ù…Ù†Ø§Ù‚Ø´Ø© ÙƒØ§ÙØ© Ø§Ù„ØªÙØ§ØµÙŠÙ„ ÙˆØ§Ù„Ø§Ø­ØªÙŠØ§Ø¬Ø§Øª." },
  ],
  socialLinks: [
    { id: "s1", platform: "twitter", url: "https://twitter.com" },
    { id: "s2", platform: "instagram", url: "https://instagram.com" },
    { id: "s3", platform: "linkedin", url: "https://linkedin.com" },
  ],
  footerLinks: [
    { id: "1", col: "services", labelEn: "Conference Booking", labelAr: "Ø­Ø¬Ø² Ø§Ù„Ù…Ø¤ØªÙ…Ø±Ø§Øª", href: "#" },
    { id: "2", col: "services", labelEn: "Exhibition Management", labelAr: "ØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø¹Ø§Ø±Ø¶", href: "#" },
    { id: "3", col: "services", labelEn: "Hotel Reservations", labelAr: "Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„ÙÙ†Ø§Ø¯Ù‚", href: "#" },
    { id: "4", col: "services", labelEn: "Reception and Farewell", labelAr: "Ø§Ù„Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ ÙˆØ§Ù„ØªÙˆØ¯ÙŠØ¹", href: "#" },
    { id: "5", col: "support", labelEn: "FAQ", labelAr: "Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©", href: "#" },
    { id: "6", col: "support", labelEn: "Privacy Policy", labelAr: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©", href: "#" },
    { id: "7", col: "support", labelEn: "Terms and Conditions", labelAr: "Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…", href: "#" },
    { id: "8", col: "support", labelEn: "Contact Us", labelAr: "ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§", href: "#" },
    { id: "9", col: "company", labelEn: "About Company", labelAr: "Ø¹Ù† Ø§Ù„Ø´Ø±ÙƒØ©", href: "#" },
    { id: "10", col: "company", labelEn: "Partners", labelAr: "Ø´Ø±ÙƒØ§Ø¡ Ø§Ù„Ù†Ø¬Ø§Ø­", href: "#" },
    { id: "11", col: "company", labelEn: "Media Center", labelAr: "Ø§Ù„Ù…Ø±ÙƒØ² Ø§Ù„Ø¥Ø¹Ù„Ø§Ù…ÙŠ", href: "#" },
    { id: "12", col: "company", labelEn: "Careers", labelAr: "ÙˆØ¸Ø§Ø¦Ù", href: "#" },
  ],
  menu: publicNavLinks.filter((item) => item.href !== "/why-us").map((item, index) => ({ id: `page-${index + 1}`, ...item, visible: true })),
  seo: {
    metaTitle: "Stylish Events | Event Booking & Management Platform",
    metaDescription: "Stylish Events provides event booking, ticketing, QR check-in, certificates, and event operations for conferences and exhibitions.",
    canonicalUrl: "https://stylish-events.com",
    keywords: "event booking, ticketing, conference management, QR check-in, certificates, Stylish Events",
    ogImage: "/og-image.jpg",
    robotsIndex: true,
    robotsFollow: true,
  },
}

function mergeSiteContentSettings(savedSettings?: Partial<SiteContentSettings> | null): SiteContentSettings {
  const parsed = savedSettings || {}
  const savedMenu = (parsed.menu?.length ? parsed.menu : defaultSettings.menu).filter((item) => item.href !== "/why-us")
  const hasPageLinks = savedMenu.some((item) => ["/upcoming-events", "/previous-events", "/about", "/contact"].includes(item.href))
  const merged = {
    ...defaultSettings,
    ...parsed,
    homepage: { ...defaultSettings.homepage, ...(parsed.homepage || {}) },
    seo: { ...defaultSettings.seo, ...(parsed.seo || {}) },
    menu: hasPageLinks ? savedMenu : defaultSettings.menu,
    featuresCards: parsed.featuresCards?.length ? parsed.featuresCards : defaultSettings.featuresCards,
    faqs: (parsed.faqs?.length ?? 0) > 1 ? parsed.faqs : defaultSettings.faqs,
    whyUsCards: parsed.whyUsCards?.length ? parsed.whyUsCards : defaultSettings.whyUsCards,
    featuresSection: { ...DEFAULT_FEATURES_SECTION, ...(parsed.featuresSection || {}) },
    homepageRequestSetup: { ...DEFAULT_HOMEPAGE_REQUEST_SETUP, ...(parsed.homepageRequestSetup || {}) },
    homepageFinalCta: { ...DEFAULT_HOMEPAGE_FINAL_CTA, ...(parsed.homepageFinalCta || {}) },
    upcomingEvents: { ...defaultSettings.upcomingEvents, ...(parsed.upcomingEvents || {}) },
    previousEvents: { ...defaultSettings.previousEvents, ...(parsed.previousEvents || {}) },
    contactPage: { ...DEFAULT_CONTACT_PAGE_SETTINGS, ...(parsed.contactPage || {}) },
    aboutPage: { ...DEFAULT_ABOUT_PAGE_SETTINGS, ...(parsed.aboutPage || {}) },
    legalPages: { ...DEFAULT_LEGAL_PAGES_SETTINGS, ...(parsed.legalPages || {}) },
  }

  return normalizeSiteContentSettings(merged) as SiteContentSettings
}

function readSettings() {
  if (typeof window === "undefined") return defaultSettings

  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return defaultSettings
    const parsed = JSON.parse(saved) as Partial<SiteContentSettings>
    if (hasCorruptedTree(parsed)) {
      window.localStorage.removeItem(storageKey)
      return defaultSettings
    }
    return mergeSiteContentSettings(parsed)
  } catch {
    window.localStorage.removeItem(storageKey)
    return defaultSettings
  }
}

export function SiteContentSettingsPanel() {
  const { language } = useLanguage()
  const isAr = language === "ar"
  const [settings, setSettings] = useState<SiteContentSettings>(defaultSettings)
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle")
  const [contentPageTab, setContentPageTab] = useState<WebsiteContentPageTab>("homepage")
  const [homepageSectionTab, setHomepageSectionTab] = useState<HomepageSectionTab>("hero")
  const [aboutSectionTab, setAboutSectionTab] = useState<AboutSectionTab>("hero")
  const [legalSectionTab, setLegalSectionTab] = useState<LegalSectionTab>("terms")
  const [savedSettingsSnapshot, setSavedSettingsSnapshot] = useState("")
  const currentSettingsSnapshot = useMemo(() => JSON.stringify(settings), [settings])
  const hasUnsavedChanges = Boolean(savedSettingsSnapshot && currentSettingsSnapshot !== savedSettingsSnapshot)

  useEffect(() => {
    const localSettings = readSettings()
    setSettings(localSettings as SiteContentSettings)
    setSavedSettingsSnapshot(JSON.stringify(localSettings))
    platformApi.getSiteContentSettings()
      .then((remote) => {
        if (!remote || !Object.keys(remote).length) return
        const next = mergeSiteContentSettings(remote)
        setSettings(next)
        setSavedSettingsSnapshot(JSON.stringify(next))
        localStorage.setItem(storageKey, JSON.stringify(next))
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!hasUnsavedChanges) return
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warnBeforeUnload)
    return () => window.removeEventListener("beforeunload", warnBeforeUnload)
  }, [hasUnsavedChanges])

  const visibleMenu = useMemo(() => settings.menu.filter((item) => item.visible), [settings.menu])

  const updateHomepage = <K extends keyof SiteContentSettings["homepage"]>(key: K, value: SiteContentSettings["homepage"][K]) => {
    setSettings((current) => ({ ...current, homepage: { ...current.homepage, [key]: value } }))
    setSaveState("idle")
  }

  const updateFeaturesSection = (patch: Partial<FeaturesSectionHeaderSettings>) => {
    setSettings((current) => ({
      ...current,
      featuresSection: {
        ...DEFAULT_FEATURES_SECTION,
        ...(current.featuresSection || {}),
        ...patch,
      },
    }))
    setSaveState("idle")
  }

  const updateEventsInspire = (patch: Partial<HomepageInspireSectionSettings>) => {
    setSettings((current) => ({
      ...current,
      homepage: {
        ...current.homepage,
        eventsInspireSection: {
          ...DEFAULT_EVENTS_INSPIRE_SECTION,
          ...(current.homepage.eventsInspireSection || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateEventsInspireTimeline = (patch: Partial<HomepageInspireSectionSettings["timeline"]>) => {
    setSettings((current) => {
      const section = current.homepage.eventsInspireSection || DEFAULT_EVENTS_INSPIRE_SECTION
      return {
        ...current,
        homepage: {
          ...current.homepage,
          eventsInspireSection: {
            ...section,
            timeline: {
              ...DEFAULT_EVENTS_INSPIRE_SECTION.timeline,
              ...(section.timeline || {}),
              ...patch,
            },
          },
        },
      }
    })
    setSaveState("idle")
  }

  const updateEventsInspireCta = (patch: Partial<HomepageInspireSectionSettings["cta"]>) => {
    setSettings((current) => {
      const section = current.homepage.eventsInspireSection || DEFAULT_EVENTS_INSPIRE_SECTION
      return {
        ...current,
        homepage: {
          ...current.homepage,
          eventsInspireSection: {
            ...section,
            cta: {
              ...DEFAULT_EVENTS_INSPIRE_SECTION.cta,
              ...(section.cta || {}),
              ...patch,
            },
          },
        },
      }
    })
    setSaveState("idle")
  }

  const updateEventsInspireGallery = (gallery: HomepageGalleryImage[]) => {
    updateEventsInspire({ gallery: gallery.slice(0, 4) })
  }

  const updateEventsInspireTimelineItems = (items: HomepageTimelineItem[]) => {
    updateEventsInspireTimeline({ items: items.slice(0, 6) })
  }

  const updateHomepageRequestSetup = (patch: Partial<HomepageRequestSetupSettings>) => {
    setSettings((current) => ({
      ...current,
      homepageRequestSetup: {
        ...DEFAULT_HOMEPAGE_REQUEST_SETUP,
        ...(current.homepageRequestSetup || {}),
        ...patch,
      },
    }))
    setSaveState("idle")
  }

  const updateHomepageRequestSetupStats = (statCards: HomepageRequestSetupStatCard[]) => {
    updateHomepageRequestSetup({ statCards: statCards.slice(0, 4) })
  }

  const updateHomepageFinalCta = (patch: Partial<HomepageFinalCtaSettings>) => {
    setSettings((current) => ({
      ...current,
      homepageFinalCta: {
        ...DEFAULT_HOMEPAGE_FINAL_CTA,
        ...(current.homepageFinalCta || {}),
        ...patch,
      },
    }))
    setSaveState("idle")
  }

  const updateSeo = <K extends keyof SiteContentSettings["seo"]>(key: K, value: SiteContentSettings["seo"][K]) => {
    setSettings((current) => ({ ...current, seo: { ...current.seo, [key]: value } }))
    setSaveState("idle")
  }

  const updateMenuItem = <K extends keyof MenuItemSettings>(id: string, key: K, value: MenuItemSettings[K]) => {
    setSettings((current) => ({
      ...current,
      menu: current.menu.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }))
    setSaveState("idle")
  }

  const updateUpcoming = (patch: Partial<EventPageSettings>) => {
    setSettings(s => ({ ...s, upcomingEvents: { ...defaultSettings.upcomingEvents, ...(s.upcomingEvents || {}), ...patch } } as SiteContentSettings))
    setSaveState("idle")
  }

  const updatePrevious = (patch: Partial<EventPageSettings>) => {
    setSettings(s => ({ ...s, previousEvents: { ...defaultSettings.previousEvents, ...(s.previousEvents || {}), ...patch } } as SiteContentSettings))
    setSaveState("idle")
  }

  const updateUpcomingInfo = (patch: Partial<EventInformationSectionSettings>) => {
    setSettings(s => ({ ...s, upcomingEvents: { ...defaultSettings.upcomingEvents!, ...(s.upcomingEvents || {}), informationSection: { ...defaultSettings.upcomingEvents!.informationSection, ...(s.upcomingEvents?.informationSection || {}), ...patch } } } as SiteContentSettings))
    setSaveState("idle")
  }

  const updatePreviousInfo = (patch: Partial<EventInformationSectionSettings>) => {
    setSettings(s => ({ ...s, previousEvents: { ...defaultSettings.previousEvents!, ...(s.previousEvents || {}), informationSection: { ...defaultSettings.previousEvents!.informationSection, ...(s.previousEvents?.informationSection || {}), ...patch } } } as SiteContentSettings))
    setSaveState("idle")
  }

  const updateContactPage = (patch: Partial<ContactPageSettings>) => {
    setSettings((current) => ({
      ...current,
      contactPage: {
        ...DEFAULT_CONTACT_PAGE_SETTINGS,
        ...(current.contactPage || {}),
        ...patch,
      },
    }))
    setSaveState("idle")
  }

  const updateContactHero = (patch: Partial<ContactPageSettings["hero"]>) => {
    setSettings((current) => ({
      ...current,
      contactPage: {
        ...DEFAULT_CONTACT_PAGE_SETTINGS,
        ...(current.contactPage || {}),
        hero: {
          ...DEFAULT_CONTACT_PAGE_SETTINGS.hero,
          ...(current.contactPage?.hero || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateContactRequest = (patch: Partial<ContactPageSettings["requestSection"]>) => {
    setSettings((current) => ({
      ...current,
      contactPage: {
        ...DEFAULT_CONTACT_PAGE_SETTINGS,
        ...(current.contactPage || {}),
        requestSection: {
          ...DEFAULT_CONTACT_PAGE_SETTINGS.requestSection,
          ...(current.contactPage?.requestSection || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateContactSuccess = (patch: Partial<ContactPageSettings["successState"]>) => {
    setSettings((current) => ({
      ...current,
      contactPage: {
        ...DEFAULT_CONTACT_PAGE_SETTINGS,
        ...(current.contactPage || {}),
        successState: {
          ...DEFAULT_CONTACT_PAGE_SETTINGS.successState,
          ...(current.contactPage?.successState || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateContactCards = (cards: ContactInformationCardSettings[]) => {
    updateContactPage({ contactCards: cards.slice(0, 4) })
  }

  const updateContactBenefits = (benefits: ContactBenefitCardSettings[]) => {
    updateContactRequest({ benefits: benefits.slice(0, 3) })
  }

  const updateContactInquiryTypes = (inquiryTypes: ContactPageSettings["requestSection"]["inquiryTypes"]) => {
    updateContactRequest({ inquiryTypes: inquiryTypes.slice(0, 10) })
  }

  const updateContactFieldLabels = (patch: Partial<ContactPageSettings["requestSection"]["fieldLabels"]>) => {
    updateContactRequest({
      fieldLabels: {
        ...settings.contactPage.requestSection.fieldLabels,
        ...patch,
      },
    })
  }

  const updateContactPlaceholders = (patch: Partial<ContactPageSettings["requestSection"]["placeholders"]>) => {
    updateContactRequest({
      placeholders: {
        ...settings.contactPage.requestSection.placeholders,
        ...patch,
      },
    })
  }

  const updateAboutPage = (patch: Partial<AboutPageSettings>) => {
    setSettings((current) => ({
      ...current,
      aboutPage: {
        ...DEFAULT_ABOUT_PAGE_SETTINGS,
        ...(current.aboutPage || {}),
        ...patch,
      },
    }))
    setSaveState("idle")
  }

  const updateAboutHero = (patch: Partial<AboutPageSettings["hero"]>) => {
    setSettings((current) => ({
      ...current,
      aboutPage: {
        ...DEFAULT_ABOUT_PAGE_SETTINGS,
        ...(current.aboutPage || {}),
        hero: {
          ...DEFAULT_ABOUT_PAGE_SETTINGS.hero,
          ...(current.aboutPage?.hero || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateAboutOverview = (patch: Partial<AboutPageSettings["overview"]>) => {
    setSettings((current) => ({
      ...current,
      aboutPage: {
        ...DEFAULT_ABOUT_PAGE_SETTINGS,
        ...(current.aboutPage || {}),
        overview: {
          ...DEFAULT_ABOUT_PAGE_SETTINGS.overview,
          ...(current.aboutPage?.overview || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateAboutEcosystem = (patch: Partial<AboutPageSettings["ecosystem"]>) => {
    setSettings((current) => ({
      ...current,
      aboutPage: {
        ...DEFAULT_ABOUT_PAGE_SETTINGS,
        ...(current.aboutPage || {}),
        ecosystem: {
          ...DEFAULT_ABOUT_PAGE_SETTINGS.ecosystem,
          ...(current.aboutPage?.ecosystem || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateAboutTeam = (patch: Partial<AboutPageSettings["team"]>) => {
    setSettings((current) => ({
      ...current,
      aboutPage: {
        ...DEFAULT_ABOUT_PAGE_SETTINGS,
        ...(current.aboutPage || {}),
        team: {
          ...DEFAULT_ABOUT_PAGE_SETTINGS.team,
          ...(current.aboutPage?.team || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateAboutVision = (patch: Partial<AboutPageSettings["vision"]>) => {
    setSettings((current) => ({
      ...current,
      aboutPage: {
        ...DEFAULT_ABOUT_PAGE_SETTINGS,
        ...(current.aboutPage || {}),
        vision: {
          ...DEFAULT_ABOUT_PAGE_SETTINGS.vision,
          ...(current.aboutPage?.vision || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateAboutValuePoints = (valuePoints: AboutValuePoint[]) => {
    updateAboutOverview({ valuePoints: valuePoints.slice(0, 3) })
  }

  const updateAboutImages = (images: AboutImageItem[]) => {
    updateAboutOverview({ images: images.slice(0, 3) })
  }

  const updateAboutCapabilityCards = (cards: AboutCapabilityCard[]) => {
    updateAboutEcosystem({ cards: cards.slice(0, 6) })
  }

  const updateAboutTeamMembers = (members: AboutTeamMember[]) => {
    updateAboutTeam({ members: members.slice(0, 12) })
  }

  const updateAboutPrinciples = (principles: AboutPrincipleItem[]) => {
    updateAboutVision({ principles: principles.slice(0, 6) })
  }

  const updateLegalPage = (page: LegalSectionTab, patch: Partial<LegalPageSettings>) => {
    setSettings((current) => ({
      ...current,
      legalPages: {
        ...DEFAULT_LEGAL_PAGES_SETTINGS,
        ...(current.legalPages || {}),
        [page]: {
          ...DEFAULT_LEGAL_PAGES_SETTINGS[page],
          ...(current.legalPages?.[page] || {}),
          ...patch,
        },
      },
    }))
    setSaveState("idle")
  }

  const updateLegalHero = (page: LegalSectionTab, patch: Partial<LegalPageSettings["hero"]>) => {
    setSettings((current) => ({
      ...current,
      legalPages: {
        ...DEFAULT_LEGAL_PAGES_SETTINGS,
        ...(current.legalPages || {}),
        [page]: {
          ...DEFAULT_LEGAL_PAGES_SETTINGS[page],
          ...(current.legalPages?.[page] || {}),
          hero: {
            ...DEFAULT_LEGAL_PAGES_SETTINGS[page].hero,
            ...(current.legalPages?.[page]?.hero || {}),
            ...patch,
          },
        },
      },
    }))
    setSaveState("idle")
  }

  const updateLegalContact = (page: LegalSectionTab, patch: Partial<LegalPageSettings["contact"]>) => {
    const currentPage = settings.legalPages?.[page] || DEFAULT_LEGAL_PAGES_SETTINGS[page]
    updateLegalPage(page, { contact: { ...currentPage.contact, ...patch } })
  }

  const updateLegalSeo = (page: LegalSectionTab, patch: Partial<LegalPageSettings["seo"]>) => {
    const currentPage = settings.legalPages?.[page] || DEFAULT_LEGAL_PAGES_SETTINGS[page]
    updateLegalPage(page, { seo: { ...currentPage.seo, ...patch } })
  }

  const updateLegalSections = (page: LegalSectionTab, sections: LegalContentSection[]) => {
    updateLegalPage(page, { sections: sections.slice(0, 20) })
  }

  const moveMenuItem = (id: string, direction: -1 | 1) => {
    setSettings((current) => {
      const menu = [...current.menu]
      const index = menu.findIndex((item) => item.id === id)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= menu.length) return current
      const [item] = menu.splice(index, 1)
      menu.splice(nextIndex, 0, item)
      return { ...current, menu }
    })
    setSaveState("idle")
  }

  const addMenuItem = () => {
    setSettings((current) => ({
      ...current,
      menu: [
        ...current.menu,
        {
          id: `menu-${Date.now()}`,
          labelEn: "New link",
          labelAr: "Ø±Ø§Ø¨Ø· Ø¬Ø¯ÙŠØ¯",
          href: "#",
          visible: true,
        },
      ],
    }))
    setSaveState("idle")
  }

  const deleteMenuItem = (id: string) => {
    setSettings((current) => ({ ...current, menu: current.menu.filter((item) => item.id !== id) }))
    setSaveState("idle")
  }

  const saveSettings = async () => {
    try {
      const saved = await platformApi.updateSiteContentSettings(settings)
      const normalized = mergeSiteContentSettings(saved || settings)
      setSettings(normalized)
      setSavedSettingsSnapshot(JSON.stringify(normalized))
      localStorage.setItem(storageKey, JSON.stringify(normalized))
      window.dispatchEvent(new Event("stylish-events-site-content-settings-updated"))
      setSaveState("saved")
      toast.success(isAr ? "ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹" : "Website settings saved", { description: isAr ? "ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙˆØ§Ù„Ù‚Ø§Ø¦Ù…Ø© ÙˆØ§Ù„Ø³ÙŠÙˆ ÙÙŠ MySQL." : "Content, menu, and SEO are stored in MySQL." })
    } catch (error) {
      // Do NOT persist failed server updates locally as successful saves.
      setSaveState("idle")
      const status = (error as any)?.status
      if (status === 401) {
        toast.error(isAr ? 'Ø§Ù†ØªÙ‡Øª Ø§Ù„Ø¬Ù„Ø³Ø©. Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹.' : 'Your session has expired. Please sign in again.')
        return
      }
      if (status === 403) {
        toast.error(isAr ? 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø­ÙØ¸ Ù‡Ø°Ù‡ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª.' : 'You do not have permission to save these settings.')
        return
      }
      const message = error instanceof Error ? error.message : (isAr ? "ÙˆØ§Ø¬Ù‡Ø© Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¨Ø§Ùƒ Ø¥Ù†Ø¯ ØºÙŠØ± Ù…ØªØ§Ø­Ø© Ø­Ø§Ù„ÙŠØ§." : "Backend settings API is not reachable.")
      toast.error(isAr ? `ÙØ´Ù„ Ø§Ù„Ø­ÙØ¸: ${message}` : `Save failed: ${message}`)
    }
  }

  const selectedLegalPage = settings.legalPages?.[legalSectionTab] || DEFAULT_LEGAL_PAGES_SETTINGS[legalSectionTab]

  return (
    <Card className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-[#17172f]">
              <Globe2 className="h-5 w-5 text-[hsl(var(--primary))]" />
              {isAr ? "Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆØ§Ù„Ù‚Ø§Ø¦Ù…Ø© ÙˆØ§Ù„Ø³ÙŠÙˆ" : "Website Content, Menu & SEO"}
            </CardTitle>
            <CardDescription className="mt-2 text-sm font-medium text-slate-500">
              {isAr ? "ØªØ­ÙƒÙ… ÙÙŠ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©ØŒ Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©ØŒ ÙˆØ¨ÙŠØ§Ù†Ø§Øª Ù…Ø­Ø±ÙƒØ§Øª Ø§Ù„Ø¨Ø­Ø« Ù…Ù† Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯." : "Control the public homepage copy, navigation links, and search engine metadata from one workspace."}
            </CardDescription>
          </div>
          <ConfirmAction
            title={isAr ? "ØªØ£ÙƒÙŠØ¯ Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹" : "Confirm website settings save"}
            description={isAr ? "Ø³ÙŠØªÙ… Ø­ÙØ¸ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© ÙˆØ±ÙˆØ§Ø¨Ø· Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© ÙˆØ¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø³ÙŠÙˆ Ù„Ù„Ù…ÙˆÙ‚Ø¹." : "Homepage content, menu links, and SEO settings will be saved for the website configuration."}
            confirmLabel={isAr ? "Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹" : "Save website settings"}
            onConfirm={saveSettings}
            tone="success"
          >
            <Button className="h-11 rounded-2xl px-5 font-extrabold">
              <Save className="h-4 w-4" />
              {saveState === "saved" ? adminT(language, "common.saved") : adminT(language, "common.save")}
            </Button>
          </ConfirmAction>
        </div>
      </CardHeader>

      <CardContent className="border-t border-slate-100 bg-white p-5">
        <Tabs value={contentPageTab} onValueChange={(value) => setContentPageTab(value as WebsiteContentPageTab)} className="space-y-5 w-full">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="inline-flex h-auto min-w-max flex-wrap items-center justify-start rounded-2xl bg-slate-100 p-1 shadow-inner">
              {websiteContentPageTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-5 py-2.5 font-extrabold">
                  {isAr ? tab.labelAr : tab.labelEn}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="homepage" className="mt-0">
            <Tabs value={homepageSectionTab} onValueChange={(value) => setHomepageSectionTab(value as HomepageSectionTab)} className="space-y-4">
              <div className="w-full overflow-x-auto pb-2">
                <TabsList className="inline-flex h-auto min-w-max flex-wrap items-center justify-start rounded-2xl bg-white p-1 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
                  {homepageSectionTabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-4 py-2 text-xs font-extrabold data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white">
                      {isAr ? tab.labelAr : tab.labelEn}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
<TabsContent value="hero" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© Ø¨Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©" : "English eyebrow"} value={settings.homepage.eyebrowEn} onChange={(value) => updateHomepage("eyebrowEn", value)} />
                <Field label={isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©" : "Arabic eyebrow"} value={settings.homepage.eyebrowAr} onChange={(value) => updateHomepage("eyebrowAr", value)} />
                <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ" : "English title"} value={settings.homepage.titleEn} onChange={(value) => updateHomepage("titleEn", value)} />
                <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¹Ø±Ø¨ÙŠ" : "Arabic title"} value={settings.homepage.titleAr} onChange={(value) => updateHomepage("titleAr", value)} />
                <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ" : "English subtitle"} value={settings.homepage.subtitleEn} onChange={(value) => updateHomepage("subtitleEn", value)} />
                <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ Ø§Ù„Ø¹Ø±Ø¨ÙŠ" : "Arabic subtitle"} value={settings.homepage.subtitleAr} onChange={(value) => updateHomepage("subtitleAr", value)} />
                <Field label={isAr ? "Ø²Ø± Ø±Ø¦ÙŠØ³ÙŠ Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ" : "Primary CTA English"} value={settings.homepage.primaryCtaEn} onChange={(value) => updateHomepage("primaryCtaEn", value)} />
                <Field label={isAr ? "Ø²Ø± Ø±Ø¦ÙŠØ³ÙŠ Ø¹Ø±Ø¨ÙŠ" : "Primary CTA Arabic"} value={settings.homepage.primaryCtaAr} onChange={(value) => updateHomepage("primaryCtaAr", value)} />
                <Field label={isAr ? "Ø²Ø± Ø«Ø§Ù†ÙˆÙŠ Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ" : "Secondary CTA English"} value={settings.homepage.secondaryCtaEn} onChange={(value) => updateHomepage("secondaryCtaEn", value)} />
                <Field label={isAr ? "Ø²Ø± Ø«Ø§Ù†ÙˆÙŠ Ø¹Ø±Ø¨ÙŠ" : "Secondary CTA Arabic"} value={settings.homepage.secondaryCtaAr} onChange={(value) => updateHomepage("secondaryCtaAr", value)} />
                <div className="space-y-2">
                  <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                    {isAr ? "Ù†ÙˆØ¹ Ù…ÙŠØ¯ÙŠØ§ Ø§Ù„Ù‡ÙŠØ±Ùˆ" : "Hero media type"}
                  </Label>
                  <Select value={settings.homepage.heroMediaType} onValueChange={(value) => updateHomepage("heroMediaType", value as "video" | "image")}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <span className="inline-flex items-center gap-2"><Video className="h-4 w-4" /> {isAr ? "ÙÙŠØ¯ÙŠÙˆ" : "Video"}</span>
                      </SelectItem>
                      <SelectItem value="image">
                        <span className="inline-flex items-center gap-2"><ImageIcon className="h-4 w-4" /> {isAr ? "ØµÙˆØ±Ø©" : "Image"}</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ImageUrlDropzone
                  label={isAr ? "Ø±Ø§Ø¨Ø· Ø£Ùˆ Ø±ÙØ¹ Ù…ÙŠØ¯ÙŠØ§ Ø§Ù„Ù‡ÙŠØ±Ùˆ" : "Hero media URL or upload"}
                  value={settings.homepage.heroMediaUrl}
                  onChange={(value) => updateHomepage("heroMediaUrl", value)}
                  helperText={isAr ? "Ø§Ø®ØªØ± ÙÙŠØ¯ÙŠÙˆ Ø£Ùˆ ØµÙˆØ±Ø© Ù…Ù† Ø§Ù„Ù†ÙˆØ¹ Ø¨Ø§Ù„Ø£Ø¹Ù„Ù‰ØŒ Ø«Ù… Ø£Ø¶Ù Ø§Ù„Ø±Ø§Ø¨Ø· Ø£Ùˆ Ø§Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù." : "Choose video or image above, then paste a URL or upload a file."}
                  accept="media"
                />
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="overflow-hidden rounded-[22px] bg-white shadow-sm">
                  <div className="relative h-36 bg-slate-100">
                    {settings.homepage.heroMediaType === "video" ? (
                      <video src={apiAssetUrl(settings.homepage.heroMediaUrl)} className="h-full w-full object-cover" muted playsInline loop />
                    ) : (
                      <img src={apiAssetUrl(settings.homepage.heroMediaUrl || "/og-image.jpg")} alt={isAr ? "Ù…Ø¹Ø§ÙŠÙ†Ø© Ù…ÙŠØ¯ÙŠØ§ Ø§Ù„Ù‡ÙŠØ±Ùˆ" : "Hero media preview"} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.10),rgba(15,23,42,0.42))]" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase text-slate-600">
                      {settings.homepage.heroMediaType}
                    </span>
                  </div>
                  <div className="p-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">{settings.homepage.eyebrowEn}</p>
                  <h3 className="mt-3 text-2xl font-extrabold leading-tight text-[#17172f]">{settings.homepage.titleEn}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{settings.homepage.subtitleEn}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-2xl bg-[hsl(var(--primary))] px-4 py-2 text-xs font-extrabold text-white">{settings.homepage.primaryCtaEn}</span>
                    <span className="rounded-2xl bg-slate-50 px-4 py-2 text-xs font-extrabold text-slate-500">{settings.homepage.secondaryCtaEn}</span>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="features" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
              <div className="space-y-5">
                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ø±Ø£Ø³ Ù‚Ø³Ù… Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª" : "Features Section Header"}</h3>
                  <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ù‚Ø³Ù… Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª" : "Enable Features section"} checked={!!settings.featuresSection.enabled} onChange={(value) => updateFeaturesSection({ enabled: value })} />
                  <Field label={isAr ? "Eyebrow (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "English eyebrow"} value={settings.featuresSection.eyebrowEn} onChange={(value) => updateFeaturesSection({ eyebrowEn: value })} dir="ltr" />
                  <Field label={isAr ? "Eyebrow (Ø¹Ø±Ø¨ÙŠ)" : "Arabic eyebrow"} value={settings.featuresSection.eyebrowAr} onChange={(value) => updateFeaturesSection({ eyebrowAr: value })} dir="rtl" />
                  <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "English title"} value={settings.featuresSection.titleEn} onChange={(value) => updateFeaturesSection({ titleEn: value })} dir="ltr" />
                  <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Arabic title"} value={settings.featuresSection.titleAr} onChange={(value) => updateFeaturesSection({ titleAr: value })} dir="rtl" />
                  <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "English description"} value={settings.featuresSection.descriptionEn} onChange={(value) => updateFeaturesSection({ descriptionEn: value })} dir="ltr" />
                  <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Arabic description"} value={settings.featuresSection.descriptionAr} onChange={(value) => updateFeaturesSection({ descriptionAr: value })} dir="rtl" />
                </div>

                <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-[#17172f]">{isAr ? "ÙƒØ±ÙˆØª Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª" : "Feature Cards"}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{isAr ? "Ø§Ù„ÙƒØ±ÙˆØª Ø§Ù„ØªÙŠ ØªØ¸Ù‡Ø± Ø¨Ø¹Ø¯ Ø§Ù„Ù‡ÙŠØ±Ùˆ ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©." : "Cards shown after the hero section on the public homepage."}</p>
                  </div>
                  <Button variant="outline" onClick={() => setSettings((current) => ({ ...current, featuresCards: [...current.featuresCards, { id: `feature-${Date.now()}`, titleEn: "New Feature", titleAr: "Ù…ÙŠØ²Ø© Ø¬Ø¯ÙŠØ¯Ø©", descEn: "", descAr: "" }] }))} className="h-11 rounded-2xl font-extrabold">
                    <Plus className="h-4 w-4" />
                    {isAr ? "Ø¥Ø¶Ø§ÙØ© Ù…ÙŠØ²Ø©" : "Add feature"}
                  </Button>
                </div>
                {settings.featuresCards.map((card, index) => (
                  <div key={card.id} className="relative grid gap-3 rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2">
                    <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ÙƒØ§Ø±Øª (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Card Title (English)"} value={card.titleEn} onChange={(value) => setSettings((current) => ({ ...current, featuresCards: current.featuresCards.map((item) => item.id === card.id ? { ...item, titleEn: value } : item) }))} />
                    <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ÙƒØ§Ø±Øª (Ø¹Ø±Ø¨ÙŠ)" : "Card Title (Arabic)"} value={card.titleAr} onChange={(value) => setSettings((current) => ({ ...current, featuresCards: current.featuresCards.map((item) => item.id === card.id ? { ...item, titleAr: value } : item) }))} />
                    <TextAreaField label={isAr ? "ÙˆØµÙ Ø§Ù„ÙƒØ§Ø±Øª (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Card Description (English)"} value={card.descEn} onChange={(value) => setSettings((current) => ({ ...current, featuresCards: current.featuresCards.map((item) => item.id === card.id ? { ...item, descEn: value } : item) }))} />
                    <TextAreaField label={isAr ? "ÙˆØµÙ Ø§Ù„ÙƒØ§Ø±Øª (Ø¹Ø±Ø¨ÙŠ)" : "Card Description (Arabic)"} value={card.descAr} onChange={(value) => setSettings((current) => ({ ...current, featuresCards: current.featuresCards.map((item) => item.id === card.id ? { ...item, descAr: value } : item) }))} />
                    <div className="absolute right-3 top-3 flex gap-1 rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
                      <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} disabled={index === 0} icon={ArrowUp} onClick={() => setSettings((current) => {
                        const cards = [...current.featuresCards]
                        const [moved] = cards.splice(index, 1)
                        cards.splice(index - 1, 0, moved)
                        return { ...current, featuresCards: cards }
                      })} />
                      <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} disabled={index === settings.featuresCards.length - 1} icon={ArrowDown} onClick={() => setSettings((current) => {
                        const cards = [...current.featuresCards]
                        const [moved] = cards.splice(index, 1)
                        cards.splice(index + 1, 0, moved)
                        return { ...current, featuresCards: cards }
                      })} />
                      <IconButton label={adminT(language, "common.delete")} icon={Trash2} tone="danger" onClick={() => setSettings((current) => ({ ...current, featuresCards: current.featuresCards.filter((item) => item.id !== card.id) }))} />
                    </div>
                  </div>
                ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="rounded-[22px] bg-[hsl(var(--primary)/0.05)] p-5 shadow-sm ring-1 ring-slate-100">
                  {!settings.featuresSection.enabled ? (
                    <div className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm">{isAr ? "Ù‚Ø³Ù… Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª Ù…Ø®ÙÙŠ Ø­Ø§Ù„ÙŠØ§" : "Features section is currently hidden"}</div>
                  ) : (
                    <>
                      <div className="text-center">
                        <p className="inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 shadow-sm">
                          {isAr ? settings.featuresSection.eyebrowAr : settings.featuresSection.eyebrowEn}
                        </p>
                        <h3 className="mt-4 text-2xl font-black leading-tight text-[#17172f]">
                          {isAr ? settings.featuresSection.titleAr : settings.featuresSection.titleEn}
                        </h3>
                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                          {isAr ? settings.featuresSection.descriptionAr : settings.featuresSection.descriptionEn}
                        </p>
                      </div>
                      <div className="mt-6 grid gap-3">
                        {settings.featuresCards.slice(0, 3).map((card) => (
                          <div key={card.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                            <p className="text-sm font-black text-[#17172f]">{isAr ? card.titleAr : card.titleEn}</p>
                            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{isAr ? card.descAr : card.descEn}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
<TabsContent value="benefits" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Title (English)"} value={settings.homepage.whyUsTitleEn} onChange={(value) => updateHomepage("whyUsTitleEn", value)} />
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Title (Arabic)"} value={settings.homepage.whyUsTitleAr} onChange={(value) => updateHomepage("whyUsTitleAr", value)} />
                <TextAreaField label={isAr ? "ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Subtitle (English)"} value={settings.homepage.whyUsSubtitleEn} onChange={(value) => updateHomepage("whyUsSubtitleEn", value)} />
                <TextAreaField label={isAr ? "ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Subtitle (Arabic)"} value={settings.homepage.whyUsSubtitleAr} onChange={(value) => updateHomepage("whyUsSubtitleAr", value)} />
              </div>
              <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                <h4 className="font-extrabold text-[#17172f]">{isAr ? "Ø§Ù„Ø¨Ø·Ø§Ù‚Ø§Øª" : "Cards"}</h4>
                {settings.whyUsCards.map((card, index) => (
                  <div key={card.id} className="grid gap-3 rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2 relative group">
                    <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Card Title (English)"} value={card.titleEn} onChange={(value) => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.map(c => c.id === card.id ? { ...c, titleEn: value } : c) }))} />
                    <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© (Ø¹Ø±Ø¨ÙŠ)" : "Card Title (Arabic)"} value={card.titleAr} onChange={(value) => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.map(c => c.id === card.id ? { ...c, titleAr: value } : c) }))} />
                    <TextAreaField label={isAr ? "ÙˆØµÙ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Card Desc (English)"} value={card.descEn} onChange={(value) => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.map(c => c.id === card.id ? { ...c, descEn: value } : c) }))} />
                    <TextAreaField label={isAr ? "ÙˆØµÙ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø© (Ø¹Ø±Ø¨ÙŠ)" : "Card Desc (Arabic)"} value={card.descAr} onChange={(value) => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.map(c => c.id === card.id ? { ...c, descAr: value } : c) }))} />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                      <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} disabled={index === 0} onClick={() => {
                        setSettings(s => {
                          const newCards = [...s.whyUsCards];
                          const [item] = newCards.splice(index, 1);
                          newCards.splice(index - 1, 0, item);
                          return { ...s, whyUsCards: newCards };
                        });
                      }} icon={ArrowUp} />
                      <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} disabled={index === settings.whyUsCards.length - 1} onClick={() => {
                        setSettings(s => {
                          const newCards = [...s.whyUsCards];
                          const [item] = newCards.splice(index, 1);
                          newCards.splice(index + 1, 0, item);
                          return { ...s, whyUsCards: newCards };
                        });
                      }} icon={ArrowDown} />
                      <IconButton label={adminT(language, "common.delete")} onClick={() => setSettings(s => ({ ...s, whyUsCards: s.whyUsCards.filter(c => c.id !== card.id) }))} icon={Trash2} tone="danger" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setSettings(s => ({ ...s, whyUsCards: [...s.whyUsCards, { id: `card-${Date.now()}`, titleEn: "New Card", titleAr: "Ø¨Ø·Ø§Ù‚Ø© Ø¬Ø¯ÙŠØ¯Ø©", descEn: "", descAr: "" }] }))} className="h-11 rounded-2xl font-extrabold w-full">
                  <Plus className="h-4 w-4" />
                  {isAr ? "Ø¥Ø¶Ø§ÙØ© Ø¨Ø·Ø§Ù‚Ø© Ø¬Ø¯ÙŠØ¯Ø©" : "Add new card"}
                </Button>
              </div>
            </div>
          </TabsContent>
<TabsContent value="available-events" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Title (English)"} value={settings.homepage.showcaseTitleEn} onChange={(value) => updateHomepage("showcaseTitleEn", value)} />
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Title (Arabic)"} value={settings.homepage.showcaseTitleAr} onChange={(value) => updateHomepage("showcaseTitleAr", value)} />
                <TextAreaField label={isAr ? "ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Subtitle (English)"} value={settings.homepage.showcaseDescEn} onChange={(value) => updateHomepage("showcaseDescEn", value)} />
                <TextAreaField label={isAr ? "ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Subtitle (Arabic)"} value={settings.homepage.showcaseDescAr} onChange={(value) => updateHomepage("showcaseDescAr", value)} />
                <Field label={isAr ? "Ø²Ø± Ø§Ù„Ø¹Ø±Ø¶ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "CTA (English)"} value={settings.homepage.showcaseCtaEn} onChange={(value) => updateHomepage("showcaseCtaEn", value)} />
                <Field label={isAr ? "Ø²Ø± Ø§Ù„Ø¹Ø±Ø¶ (Ø¹Ø±Ø¨ÙŠ)" : "CTA (Arabic)"} value={settings.homepage.showcaseCtaAr} onChange={(value) => updateHomepage("showcaseCtaAr", value)} />
              </div>
            </div>
          </TabsContent>
<TabsContent value="events-inspire" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_420px]">
              <div className="space-y-5">
                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Events That Inspire - Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ" : "Events That Inspire - Main Content"}</h3>
                  <ToggleCard label={isAr ? "ØªÙ…ÙƒÙŠÙ† Ø§Ù„Ù‚Ø³Ù…" : "Enable section"} checked={!!settings.homepage.eventsInspireSection.enabled} onChange={(value) => updateEventsInspire({ enabled: value })} />
                  <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø®Ø· Ø§Ù„Ø²Ø®Ø±ÙÙŠ" : "Show accent line"} checked={!!settings.homepage.eventsInspireSection.showAccentLine} onChange={(value) => updateEventsInspire({ showAccentLine: value })} />
                  <Field label={isAr ? "Eyebrow (English)" : "Eyebrow (English)"} value={settings.homepage.eventsInspireSection.eyebrowEn} onChange={(value) => updateEventsInspire({ eyebrowEn: value })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Eyebrow (Arabic)" : "Eyebrow (Arabic)"}</Label>
                    <Input value={settings.homepage.eventsInspireSection.eyebrowAr} onChange={(event) => updateEventsInspire({ eyebrowAr: event.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <Field label={isAr ? "Title (English)" : "Title (English)"} value={settings.homepage.eventsInspireSection.titleEn} onChange={(value) => updateEventsInspire({ titleEn: value })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Title (Arabic)" : "Title (Arabic)"}</Label>
                    <Input value={settings.homepage.eventsInspireSection.titleAr} onChange={(event) => updateEventsInspire({ titleAr: event.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <TextAreaField label={isAr ? "Description (English)" : "Description (English)"} value={settings.homepage.eventsInspireSection.descriptionEn} onChange={(value) => updateEventsInspire({ descriptionEn: value })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Description (Arabic)" : "Description (Arabic)"}</Label>
                    <Textarea value={settings.homepage.eventsInspireSection.descriptionAr} onChange={(event) => updateEventsInspire({ descriptionAr: event.target.value })} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <Field label={isAr ? "Anchor ID" : "Anchor ID"} value={settings.homepage.eventsInspireSection.anchorId || ""} onChange={(value) => updateEventsInspire({ anchorId: value })} className="md:col-span-2" />
                </div>

                <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-[#17172f]">{isAr ? "Horizontal Timeline" : "Horizontal Timeline"}</h3>
                    <ToggleCard label={isAr ? "ØªÙ…ÙƒÙŠÙ† Ø§Ù„ØªØ§ÙŠÙ…Ù„Ø§ÙŠÙ†" : "Enable timeline"} checked={!!settings.homepage.eventsInspireSection.timeline.enabled} onChange={(value) => updateEventsInspireTimeline({ enabled: value })} />
                  </div>
                  {settings.homepage.eventsInspireSection.timeline.items.map((item, index) => (
                    <div key={item.id} className="relative grid gap-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-3">
                      <Field label={isAr ? "Label EN" : "Label EN"} value={item.labelEn} onChange={(value) => updateEventsInspireTimelineItems(settings.homepage.eventsInspireSection.timeline.items.map((entry) => entry.id === item.id ? { ...entry, labelEn: value } : entry))} />
                      <Field label={isAr ? "Title EN" : "Title EN"} value={item.titleEn} onChange={(value) => updateEventsInspireTimelineItems(settings.homepage.eventsInspireSection.timeline.items.map((entry) => entry.id === item.id ? { ...entry, titleEn: value } : entry))} />
                      <TextAreaField label={isAr ? "Description EN" : "Description EN"} value={item.descriptionEn} onChange={(value) => updateEventsInspireTimelineItems(settings.homepage.eventsInspireSection.timeline.items.map((entry) => entry.id === item.id ? { ...entry, descriptionEn: value } : entry))} />
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500">Label AR</Label>
                        <Input value={item.labelAr} onChange={(event) => updateEventsInspireTimelineItems(settings.homepage.eventsInspireSection.timeline.items.map((entry) => entry.id === item.id ? { ...entry, labelAr: event.target.value } : entry))} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500">Title AR</Label>
                        <Input value={item.titleAr} onChange={(event) => updateEventsInspireTimelineItems(settings.homepage.eventsInspireSection.timeline.items.map((entry) => entry.id === item.id ? { ...entry, titleAr: event.target.value } : entry))} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500">Description AR</Label>
                        <Textarea value={item.descriptionAr} onChange={(event) => updateEventsInspireTimelineItems(settings.homepage.eventsInspireSection.timeline.items.map((entry) => entry.id === item.id ? { ...entry, descriptionAr: event.target.value } : entry))} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                      </div>
                      <div className="absolute right-3 top-3 flex gap-1 rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
                        <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} disabled={index === 0} icon={ArrowUp} onClick={() => {
                          const items = [...settings.homepage.eventsInspireSection.timeline.items]
                          const [moved] = items.splice(index, 1)
                          items.splice(index - 1, 0, moved)
                          updateEventsInspireTimelineItems(items)
                        }} />
                        <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} disabled={index === settings.homepage.eventsInspireSection.timeline.items.length - 1} icon={ArrowDown} onClick={() => {
                          const items = [...settings.homepage.eventsInspireSection.timeline.items]
                          const [moved] = items.splice(index, 1)
                          items.splice(index + 1, 0, moved)
                          updateEventsInspireTimelineItems(items)
                        }} />
                        <IconButton label={adminT(language, "common.delete")} icon={Trash2} tone="danger" onClick={() => updateEventsInspireTimelineItems(settings.homepage.eventsInspireSection.timeline.items.filter((entry) => entry.id !== item.id))} />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    disabled={settings.homepage.eventsInspireSection.timeline.items.length >= 6}
                    onClick={() => updateEventsInspireTimelineItems([...settings.homepage.eventsInspireSection.timeline.items, { id: `inspire-${Date.now()}`, labelEn: "04", labelAr: "04", titleEn: "New step", titleAr: "Ø®Ø·ÙˆØ© Ø¬Ø¯ÙŠØ¯Ø©", descriptionEn: "", descriptionAr: "" }])}
                    className="h-11 w-full rounded-2xl font-extrabold"
                  >
                    <Plus className="h-4 w-4" />
                    {isAr ? "Ø¥Ø¶Ø§ÙØ© Ø¹Ù†ØµØ± Timeline" : "Add timeline item"}
                  </Button>
                </div>

                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "CTA Button" : "CTA Button"}</h3>
                  <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²Ø±" : "Show CTA"} checked={!!settings.homepage.eventsInspireSection.cta.enabled} onChange={(value) => updateEventsInspireCta({ enabled: value })} />
                  <ToggleCard label={isAr ? "ÙØªØ­ ÙÙŠ ØªØ¨ÙˆÙŠØ¨ Ø¬Ø¯ÙŠØ¯" : "Open in new tab"} checked={!!settings.homepage.eventsInspireSection.cta.openInNewTab} onChange={(value) => updateEventsInspireCta({ openInNewTab: value })} />
                  <Field label={isAr ? "Label EN" : "Label EN"} value={settings.homepage.eventsInspireSection.cta.labelEn} onChange={(value) => updateEventsInspireCta({ labelEn: value })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">Label AR</Label>
                    <Input value={settings.homepage.eventsInspireSection.cta.labelAr} onChange={(event) => updateEventsInspireCta({ labelAr: event.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <Field label={isAr ? "CTA URL" : "CTA URL"} value={settings.homepage.eventsInspireSection.cta.url} onChange={(value) => updateEventsInspireCta({ url: value })} />
                  <div className="space-y-2">
                    <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "Ù†ÙˆØ¹ Ø§Ù„Ø±Ø§Ø¨Ø·" : "Link type"}</Label>
                    <Select value={settings.homepage.eventsInspireSection.cta.linkType} onValueChange={(value) => updateEventsInspireCta({ linkType: value as "internal" | "external" })}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">{isAr ? "Ø¯Ø§Ø®Ù„ÙŠ" : "Internal"}</SelectItem>
                        <SelectItem value="external">{isAr ? "Ø®Ø§Ø±Ø¬ÙŠ" : "External"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 rounded-[22px] bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-black text-[#17172f]">{isAr ? "Four-Image Gallery" : "Four-Image Gallery"}</h3>
                  {settings.homepage.eventsInspireSection.gallery.slice(0, 4).map((image, index) => (
                    <div key={image.id} className="grid gap-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2">
                      <ImageUrlDropzone
                        label={`${isAr ? "Ø§Ù„ØµÙˆØ±Ø©" : "Image"} ${index + 1}`}
                        value={image.imageUrl}
                        onChange={(value) => updateEventsInspireGallery(settings.homepage.eventsInspireSection.gallery.map((entry) => entry.id === image.id ? { ...entry, imageUrl: value } : entry))}
                        previewClassName="bg-slate-50"
                      />
                      <div className="grid gap-3">
                        <Field label="Alt EN" value={image.altEn} onChange={(value) => updateEventsInspireGallery(settings.homepage.eventsInspireSection.gallery.map((entry) => entry.id === image.id ? { ...entry, altEn: value } : entry))} />
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500">Alt AR</Label>
                          <Input value={image.altAr} onChange={(event) => updateEventsInspireGallery(settings.homepage.eventsInspireSection.gallery.map((entry) => entry.id === image.id ? { ...entry, altAr: event.target.value } : entry))} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "Ù…ÙˆØ¶Ø¹ Ø§Ù„ØªØ±ÙƒÙŠØ²" : "Focal position"}</Label>
                          <Select value={image.focalPosition} onValueChange={(value) => updateEventsInspireGallery(settings.homepage.eventsInspireSection.gallery.map((entry) => entry.id === image.id ? { ...entry, focalPosition: value as HomepageGalleryImage["focalPosition"] } : entry))}>
                            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["center", "top", "bottom", "left", "right"].map((position) => (
                                <SelectItem key={position} value={position}>{position}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" onClick={() => updateEventsInspireGallery(settings.homepage.eventsInspireSection.gallery.map((entry) => entry.id === image.id ? { ...entry, imageUrl: "" } : entry))} className="h-10 rounded-2xl font-extrabold text-red-600">
                          <Trash2 className="h-4 w-4" />
                          {isAr ? "Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØµÙˆØ±Ø©" : "Remove image"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className={cn("rounded-[22px] bg-slate-50 p-4", isAr && "text-right")} dir={isAr ? "rtl" : "ltr"}>
                  {!settings.homepage.eventsInspireSection.enabled ? (
                    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm font-extrabold text-slate-400">
                      {isAr ? "Ø§Ù„Ù‚Ø³Ù… Ù…Ø®ÙÙŠ Ø­Ø§Ù„ÙŠØ§" : "Section is currently hidden"}
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[hsl(var(--primary))]">
                        {isAr ? settings.homepage.eventsInspireSection.eyebrowAr : settings.homepage.eventsInspireSection.eyebrowEn}
                      </p>
                      <h3 className="mt-3 text-3xl font-black leading-tight text-[#17172f]">
                        {isAr ? settings.homepage.eventsInspireSection.titleAr : settings.homepage.eventsInspireSection.titleEn}
                      </h3>
                      {settings.homepage.eventsInspireSection.showAccentLine ? <div className={cn("mt-4 h-1 w-16 rounded-full bg-[hsl(var(--primary))]", isAr && "mr-auto")} /> : null}
                      <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
                        {isAr ? settings.homepage.eventsInspireSection.descriptionAr : settings.homepage.eventsInspireSection.descriptionEn}
                      </p>
                      {settings.homepage.eventsInspireSection.timeline.enabled ? (
                        <div className="mt-6 grid gap-3">
                          {settings.homepage.eventsInspireSection.timeline.items.map((item) => (
                            <div key={item.id} className="grid grid-cols-[36px_1fr] gap-3 rounded-2xl bg-white p-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-black text-white">{isAr ? item.labelAr : item.labelEn}</span>
                              <div>
                                <p className="text-sm font-black text-[#17172f]">{isAr ? item.titleAr : item.titleEn}</p>
                                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{isAr ? item.descriptionAr : item.descriptionEn}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {settings.homepage.eventsInspireSection.cta.enabled ? (
                        <span className="mt-6 inline-flex rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-extrabold text-white">
                          {isAr ? settings.homepage.eventsInspireSection.cta.labelAr : settings.homepage.eventsInspireSection.cta.labelEn}
                        </span>
                      ) : null}
                      <div className="mt-6 grid grid-cols-2 gap-2">
                        {settings.homepage.eventsInspireSection.gallery.slice(0, 4).map((image, index) => (
                          <div key={image.id} className={cn("overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100", index === 2 ? "row-span-2 min-h-[170px]" : "min-h-[92px]")}>
                            {image.imageUrl ? (
                              <img src={apiAssetUrl(image.imageUrl)} alt={isAr ? image.altAr : image.altEn} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full min-h-[92px] items-center justify-center text-slate-300">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="request-setup" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
              <div className="space-y-5">
                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ù…Ø­ØªÙˆÙ‰ Request Setup" : "Request Setup Content"}</h3>
                  <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù‚Ø³Ù…" : "Enable section"} checked={!!settings.homepageRequestSetup.enabled} onChange={(value) => updateHomepageRequestSetup({ enabled: value })} />
                  <Field label={isAr ? "Eyebrow (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Eyebrow (English)"} value={settings.homepageRequestSetup.eyebrowEn} onChange={(value) => updateHomepageRequestSetup({ eyebrowEn: value })} />
                  <Field label={isAr ? "Eyebrow (Ø¹Ø±Ø¨ÙŠ)" : "Eyebrow (Arabic)"} value={settings.homepageRequestSetup.eyebrowAr} onChange={(value) => updateHomepageRequestSetup({ eyebrowAr: value })} />
                  <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Title (English)"} value={settings.homepageRequestSetup.titleEn} onChange={(value) => updateHomepageRequestSetup({ titleEn: value })} />
                  <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Title (Arabic)"} value={settings.homepageRequestSetup.titleAr} onChange={(value) => updateHomepageRequestSetup({ titleAr: value })} />
                  <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Description (English)"} value={settings.homepageRequestSetup.descriptionEn} onChange={(value) => updateHomepageRequestSetup({ descriptionEn: value })} />
                  <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Description (Arabic)"} value={settings.homepageRequestSetup.descriptionAr} onChange={(value) => updateHomepageRequestSetup({ descriptionAr: value })} />
                  <TextAreaField label={isAr ? "Ù†Øµ Ù…Ø³Ø§Ø¹Ø¯ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Supporting text (English)"} value={settings.homepageRequestSetup.supportingTextEn} onChange={(value) => updateHomepageRequestSetup({ supportingTextEn: value })} />
                  <TextAreaField label={isAr ? "Ù†Øµ Ù…Ø³Ø§Ø¹Ø¯ (Ø¹Ø±Ø¨ÙŠ)" : "Supporting text (Arabic)"} value={settings.homepageRequestSetup.supportingTextAr} onChange={(value) => updateHomepageRequestSetup({ supportingTextAr: value })} />
                </div>

                <div className="space-y-4 rounded-[22px] bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-black text-[#17172f]">{isAr ? "ÙƒØ±ÙˆØª Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø¨Ø¬Ø§Ù†Ø¨ Ø§Ù„ÙÙˆØ±Ù…" : "Stat Cards Beside Form"}</h3>
                  {settings.homepageRequestSetup.statCards.map((card, index) => (
                    <div key={card.id} className="grid gap-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-[0.7fr_1fr_1fr_auto]">
                      <Field label={isAr ? "Ø§Ù„Ù‚ÙŠÙ…Ø©" : "Value"} value={card.value} onChange={(value) => updateHomepageRequestSetupStats(settings.homepageRequestSetup.statCards.map((item) => item.id === card.id ? { ...item, value } : item))} />
                      <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Label (English)"} value={card.labelEn} onChange={(value) => updateHomepageRequestSetupStats(settings.homepageRequestSetup.statCards.map((item) => item.id === card.id ? { ...item, labelEn: value } : item))} />
                      <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Label (Arabic)"} value={card.labelAr} onChange={(value) => updateHomepageRequestSetupStats(settings.homepageRequestSetup.statCards.map((item) => item.id === card.id ? { ...item, labelAr: value } : item))} />
                      <div className="flex items-end">
                        <IconButton label={adminT(language, "common.delete")} onClick={() => updateHomepageRequestSetupStats(settings.homepageRequestSetup.statCards.filter((_, i) => i !== index))} icon={Trash2} tone="danger" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => updateHomepageRequestSetupStats([...(settings.homepageRequestSetup.statCards || []), { id: `setup-stat-${Date.now()}`, value: "0+", labelEn: "New stat", labelAr: "Ø¥Ø­ØµØ§Ø¦ÙŠØ© Ø¬Ø¯ÙŠØ¯Ø©" }])} className="h-11 rounded-2xl font-extrabold w-full" disabled={(settings.homepageRequestSetup.statCards || []).length >= 4}>
                    <Plus className="h-4 w-4" />
                    {isAr ? "Ø¥Ø¶Ø§ÙØ© ÙƒØ§Ø±Øª" : "Add stat card"}
                  </Button>
                </div>

                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Labels Ø§Ù„ÙÙˆØ±Ù… Ø§Ù„Ø¢Ù…Ù†Ø©" : "Safe Form Labels"}</h3>
                  {[0, 1, 2].map((index) => (
                    <div key={`setup-step-${index}`} className="grid gap-3 rounded-[18px] border border-slate-100 p-3 md:grid-cols-2 md:col-span-2">
                      <Field label={`${isAr ? "Step EN" : "Step label EN"} #${index + 1}`} value={settings.homepageRequestSetup.stepsEn[index]} onChange={(value) => {
                        const steps = [...settings.homepageRequestSetup.stepsEn] as [string, string, string]
                        steps[index] = value
                        updateHomepageRequestSetup({ stepsEn: steps })
                      }} />
                      <Field label={`${isAr ? "Step AR" : "Step label AR"} #${index + 1}`} value={settings.homepageRequestSetup.stepsAr[index]} onChange={(value) => {
                        const steps = [...settings.homepageRequestSetup.stepsAr] as [string, string, string]
                        steps[index] = value
                        updateHomepageRequestSetup({ stepsAr: steps })
                      }} />
                    </div>
                  ))}
                  <Field label={isAr ? "Ø²Ø± Ø§Ù„ØªØ§Ù„ÙŠ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Next button (English)"} value={settings.homepageRequestSetup.nextLabelEn} onChange={(value) => updateHomepageRequestSetup({ nextLabelEn: value })} />
                  <Field label={isAr ? "Ø²Ø± Ø§Ù„ØªØ§Ù„ÙŠ (Ø¹Ø±Ø¨ÙŠ)" : "Next button (Arabic)"} value={settings.homepageRequestSetup.nextLabelAr} onChange={(value) => updateHomepageRequestSetup({ nextLabelAr: value })} />
                  <Field label={isAr ? "Ø²Ø± Ø§Ù„Ø³Ø§Ø¨Ù‚ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Back button (English)"} value={settings.homepageRequestSetup.backLabelEn} onChange={(value) => updateHomepageRequestSetup({ backLabelEn: value })} />
                  <Field label={isAr ? "Ø²Ø± Ø§Ù„Ø³Ø§Ø¨Ù‚ (Ø¹Ø±Ø¨ÙŠ)" : "Back button (Arabic)"} value={settings.homepageRequestSetup.backLabelAr} onChange={(value) => updateHomepageRequestSetup({ backLabelAr: value })} />
                  <Field label={isAr ? "Ø²Ø± Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Submit button (English)"} value={settings.homepageRequestSetup.submitLabelEn} onChange={(value) => updateHomepageRequestSetup({ submitLabelEn: value })} />
                  <Field label={isAr ? "Ø²Ø± Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ (Ø¹Ø±Ø¨ÙŠ)" : "Submit button (Arabic)"} value={settings.homepageRequestSetup.submitLabelAr} onChange={(value) => updateHomepageRequestSetup({ submitLabelAr: value })} />
                  <Field label={isAr ? "Ø­Ø§Ù„Ø© Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Sending label (English)"} value={settings.homepageRequestSetup.sendingLabelEn} onChange={(value) => updateHomepageRequestSetup({ sendingLabelEn: value })} />
                  <Field label={isAr ? "Ø­Ø§Ù„Ø© Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ (Ø¹Ø±Ø¨ÙŠ)" : "Sending label (Arabic)"} value={settings.homepageRequestSetup.sendingLabelAr} onChange={(value) => updateHomepageRequestSetup({ sendingLabelAr: value })} />
                </div>

                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ù†Ø¬Ø§Ø­" : "Success State"}</h3>
                  <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù†Ø¬Ø§Ø­ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Success title (English)"} value={settings.homepageRequestSetup.successTitleEn} onChange={(value) => updateHomepageRequestSetup({ successTitleEn: value })} />
                  <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù†Ø¬Ø§Ø­ (Ø¹Ø±Ø¨ÙŠ)" : "Success title (Arabic)"} value={settings.homepageRequestSetup.successTitleAr} onChange={(value) => updateHomepageRequestSetup({ successTitleAr: value })} />
                  <TextAreaField label={isAr ? "ÙˆØµÙ Ø§Ù„Ù†Ø¬Ø§Ø­ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Success description (English)"} value={settings.homepageRequestSetup.successDescriptionEn} onChange={(value) => updateHomepageRequestSetup({ successDescriptionEn: value })} />
                  <TextAreaField label={isAr ? "ÙˆØµÙ Ø§Ù„Ù†Ø¬Ø§Ø­ (Ø¹Ø±Ø¨ÙŠ)" : "Success description (Arabic)"} value={settings.homepageRequestSetup.successDescriptionAr} onChange={(value) => updateHomepageRequestSetup({ successDescriptionAr: value })} />
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="rounded-[22px] bg-[hsl(var(--primary))] p-5 text-white shadow-sm">
                  {!settings.homepageRequestSetup.enabled ? (
                    <div className="rounded-2xl bg-white/10 p-5 text-sm font-bold text-white/80">{isAr ? "Ø§Ù„Ù‚Ø³Ù… Ù…Ø®ÙÙŠ Ø­Ø§Ù„ÙŠØ§" : "Section is currently hidden"}</div>
                  ) : (
                    <>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">{isAr ? settings.homepageRequestSetup.eyebrowAr : settings.homepageRequestSetup.eyebrowEn}</p>
                      <h3 className="mt-3 text-2xl font-black leading-tight">{isAr ? settings.homepageRequestSetup.titleAr : settings.homepageRequestSetup.titleEn}</h3>
                      <p className="mt-3 text-sm font-semibold leading-6 text-white/75">{isAr ? settings.homepageRequestSetup.descriptionAr : settings.homepageRequestSetup.descriptionEn}</p>
                      <p className="mt-3 text-xs font-semibold leading-5 text-white/60">{isAr ? settings.homepageRequestSetup.supportingTextAr : settings.homepageRequestSetup.supportingTextEn}</p>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {settings.homepageRequestSetup.statCards.map((card) => (
                          <div key={card.id} className="rounded-2xl bg-white/10 p-3">
                            <div className="text-2xl font-black">{card.value}</div>
                            <div className="mt-1 text-[11px] font-semibold text-white/70">{isAr ? card.labelAr : card.labelEn}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 rounded-2xl bg-white p-4 text-slate-800">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="flex flex-1 items-center gap-2">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-black text-white">{item}</span>
                              {item < 3 ? <span className="h-1 flex-1 rounded-full bg-slate-100" /> : null}
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                          {isAr ? `Ø§Ù„Ø®Ø·ÙˆØ© 1 Ù…Ù† 3 - ${settings.homepageRequestSetup.stepsAr[0]}` : `Step 1 of 3 - ${settings.homepageRequestSetup.stepsEn[0]}`}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="h-10 rounded-xl bg-slate-50" />
                          <div className="h-10 rounded-xl bg-slate-50" />
                        </div>
                        <div className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-center text-xs font-black text-white">
                          {isAr ? settings.homepageRequestSetup.nextLabelAr : settings.homepageRequestSetup.nextLabelEn}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
<TabsContent value="faq" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Eyebrow (English)"} value={settings.homepage.faqEyebrowEn} onChange={(value) => updateHomepage("faqEyebrowEn", value)} />
                <Field label={isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¹Ø±Ø¨ÙŠ)" : "Eyebrow (Arabic)"} value={settings.homepage.faqEyebrowAr} onChange={(value) => updateHomepage("faqEyebrowAr", value)} />
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Title (English)"} value={settings.homepage.faqTitleEn} onChange={(value) => updateHomepage("faqTitleEn", value)} />
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Title (Arabic)"} value={settings.homepage.faqTitleAr} onChange={(value) => updateHomepage("faqTitleAr", value)} />
                <TextAreaField label={isAr ? "ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Subtitle (English)"} value={settings.homepage.faqSubtitleEn} onChange={(value) => updateHomepage("faqSubtitleEn", value)} />
                <TextAreaField label={isAr ? "ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Subtitle (Arabic)"} value={settings.homepage.faqSubtitleAr} onChange={(value) => updateHomepage("faqSubtitleAr", value)} />
              </div>
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <Field label={isAr ? "Ù†Øµ ÙˆØ§ØªØ³Ø§Ø¨ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "WhatsApp Text (English)"} value={settings.homepage.faqWhatsappTextEn} onChange={(value) => updateHomepage("faqWhatsappTextEn", value)} />
                <Field label={isAr ? "Ù†Øµ ÙˆØ§ØªØ³Ø§Ø¨ (Ø¹Ø±Ø¨ÙŠ)" : "WhatsApp Text (Arabic)"} value={settings.homepage.faqWhatsappTextAr} onChange={(value) => updateHomepage("faqWhatsappTextAr", value)} />
                <Field label={isAr ? "Ø±Ø§Ø¨Ø· ÙˆØ§ØªØ³Ø§Ø¨" : "WhatsApp URL"} value={settings.homepage.faqWhatsappUrl || ''} onChange={(value) => updateHomepage("faqWhatsappUrl", value)} className="md:col-span-2" />
              </div>
              <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                <h4 className="font-extrabold text-[#17172f]">{isAr ? "Ø§Ù„Ø£Ø³Ø¦Ù„Ø© ÙˆØ§Ù„Ø¥Ø¬Ø§Ø¨Ø§Øª" : "Questions & Answers"}</h4>
                {settings.faqs.map((faq, index) => (
                  <div key={faq.id} className="grid gap-3 rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2 relative group">
                    <Field label={isAr ? "Ø§Ù„Ø³Ø¤Ø§Ù„ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Question (English)"} value={faq.qEn} onChange={(value) => setSettings(s => ({ ...s, faqs: s.faqs.map(f => f.id === faq.id ? { ...f, qEn: value } : f) }))} />
                    <Field label={isAr ? "Ø§Ù„Ø³Ø¤Ø§Ù„ (Ø¹Ø±Ø¨ÙŠ)" : "Question (Arabic)"} value={faq.qAr} onChange={(value) => setSettings(s => ({ ...s, faqs: s.faqs.map(f => f.id === faq.id ? { ...f, qAr: value } : f) }))} />
                    <TextAreaField label={isAr ? "Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Answer (English)"} value={faq.aEn} onChange={(value) => setSettings(s => ({ ...s, faqs: s.faqs.map(f => f.id === faq.id ? { ...f, aEn: value } : f) }))} />
                    <TextAreaField label={isAr ? "Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© (Ø¹Ø±Ø¨ÙŠ)" : "Answer (Arabic)"} value={faq.aAr} onChange={(value) => setSettings(s => ({ ...s, faqs: s.faqs.map(f => f.id === faq.id ? { ...f, aAr: value } : f) }))} />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                      <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} disabled={index === 0} onClick={() => {
                        setSettings(s => {
                          const newFaqs = [...s.faqs];
                          const [item] = newFaqs.splice(index, 1);
                          newFaqs.splice(index - 1, 0, item);
                          return { ...s, faqs: newFaqs };
                        });
                      }} icon={ArrowUp} />
                      <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} disabled={index === settings.faqs.length - 1} onClick={() => {
                        setSettings(s => {
                          const newFaqs = [...s.faqs];
                          const [item] = newFaqs.splice(index, 1);
                          newFaqs.splice(index + 1, 0, item);
                          return { ...s, faqs: newFaqs };
                        });
                      }} icon={ArrowDown} />
                      <IconButton label={adminT(language, "common.delete")} onClick={() => setSettings(s => ({ ...s, faqs: s.faqs.filter(f => f.id !== faq.id) }))} icon={Trash2} tone="danger" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setSettings(s => ({ ...s, faqs: [...s.faqs, { id: `faq-${Date.now()}`, qEn: "New Question", qAr: "Ø³Ø¤Ø§Ù„ Ø¬Ø¯ÙŠØ¯", aEn: "", aAr: "" }] }))} className="h-11 rounded-2xl font-extrabold w-full">
                  <Plus className="h-4 w-4" />
                  {isAr ? "Ø¥Ø¶Ø§ÙØ© Ø³Ø¤Ø§Ù„ Ø¬Ø¯ÙŠØ¯" : "Add new question"}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="final-cta" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Final CTA" : "Final CTA Settings"}</h3>
                <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù‚Ø³Ù…" : "Enable section"} checked={!!settings.homepageFinalCta.enabled} onChange={(value) => updateHomepageFinalCta({ enabled: value })} />
                <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø²Ø± Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ" : "Enable primary button"} checked={!!settings.homepageFinalCta.primaryButtonEnabled} onChange={(value) => updateHomepageFinalCta({ primaryButtonEnabled: value })} />
                <Field label={isAr ? "Eyebrow (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Eyebrow (English)"} value={settings.homepageFinalCta.eyebrowEn} onChange={(value) => updateHomepageFinalCta({ eyebrowEn: value })} />
                <Field label={isAr ? "Eyebrow (Ø¹Ø±Ø¨ÙŠ)" : "Eyebrow (Arabic)"} value={settings.homepageFinalCta.eyebrowAr} onChange={(value) => updateHomepageFinalCta({ eyebrowAr: value })} />
                <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Title (English)"} value={settings.homepageFinalCta.titleEn} onChange={(value) => updateHomepageFinalCta({ titleEn: value })} />
                <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Title (Arabic)"} value={settings.homepageFinalCta.titleAr} onChange={(value) => updateHomepageFinalCta({ titleAr: value })} />
                <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Description (English)"} value={settings.homepageFinalCta.descriptionEn} onChange={(value) => updateHomepageFinalCta({ descriptionEn: value })} />
                <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Description (Arabic)"} value={settings.homepageFinalCta.descriptionAr} onChange={(value) => updateHomepageFinalCta({ descriptionAr: value })} />
                <Field label={isAr ? "Ù†Øµ Ø§Ù„Ø²Ø± (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Primary button label (English)"} value={settings.homepageFinalCta.primaryButtonLabelEn} onChange={(value) => updateHomepageFinalCta({ primaryButtonLabelEn: value })} />
                <Field label={isAr ? "Ù†Øµ Ø§Ù„Ø²Ø± (Ø¹Ø±Ø¨ÙŠ)" : "Primary button label (Arabic)"} value={settings.homepageFinalCta.primaryButtonLabelAr} onChange={(value) => updateHomepageFinalCta({ primaryButtonLabelAr: value })} />
                <Field label={isAr ? "Ø±Ø§Ø¨Ø· Ø§Ù„Ø²Ø±" : "Primary button URL"} value={settings.homepageFinalCta.primaryButtonUrl} onChange={(value) => updateHomepageFinalCta({ primaryButtonUrl: value })} />
                <ToggleCard label={isAr ? "ÙØªØ­ Ø§Ù„Ø±Ø§Ø¨Ø· ÙÙŠ ØªØ¨ÙˆÙŠØ¨ Ø¬Ø¯ÙŠØ¯" : "Open in new tab"} checked={!!settings.homepageFinalCta.primaryButtonOpenInNewTab} onChange={(value) => updateHomepageFinalCta({ primaryButtonOpenInNewTab: value })} />
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="rounded-[22px] bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
                  {!settings.homepageFinalCta.enabled ? (
                    <div className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">{isAr ? "Ø§Ù„Ù‚Ø³Ù… Ù…Ø®ÙÙŠ Ø­Ø§Ù„ÙŠØ§" : "Section is currently hidden"}</div>
                  ) : (
                    <>
                      <p className="inline-flex rounded-full border border-slate-100 bg-slate-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                        {isAr ? settings.homepageFinalCta.eyebrowAr : settings.homepageFinalCta.eyebrowEn}
                      </p>
                      <h3 className="mt-5 text-3xl font-black leading-tight text-[#17172f]">
                        {isAr ? settings.homepageFinalCta.titleAr : settings.homepageFinalCta.titleEn}
                      </h3>
                      <p className="mx-auto mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-500">
                        {isAr ? settings.homepageFinalCta.descriptionAr : settings.homepageFinalCta.descriptionEn}
                      </p>
                      {settings.homepageFinalCta.primaryButtonEnabled ? (
                        <span className="mt-6 inline-flex rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-extrabold text-white shadow-lg">
                          {isAr ? settings.homepageFinalCta.primaryButtonLabelAr : settings.homepageFinalCta.primaryButtonLabelEn}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="about" className="mt-0">
            <Tabs value={aboutSectionTab} onValueChange={(value) => setAboutSectionTab(value as AboutSectionTab)} className="space-y-4">
              <div className="w-full overflow-x-auto pb-2">
                <TabsList className="inline-flex h-auto min-w-max flex-wrap items-center justify-start rounded-2xl bg-white p-1 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
                  {aboutSectionTabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-4 py-2 text-xs font-extrabold data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-white">
                      {isAr ? tab.labelAr : tab.labelEn}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="hero" className="mt-0">
                <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
                  <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                    <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ù‡ÙŠØ±Ùˆ ØµÙØ­Ø© About" : "About Hero"}</h3>
                    <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù‚Ø³Ù…" : "Enable section"} checked={!!settings.aboutPage.hero.enabled} onChange={(value) => updateAboutHero({ enabled: value })} />
                    <Field label="Eyebrow EN" value={settings.aboutPage.hero.eyebrowEn} onChange={(value) => updateAboutHero({ eyebrowEn: value })} />
                    <Field label="Eyebrow AR" value={settings.aboutPage.hero.eyebrowAr} onChange={(value) => updateAboutHero({ eyebrowAr: value })} dir="rtl" />
                    <Field label="Title EN" value={settings.aboutPage.hero.titleEn} onChange={(value) => updateAboutHero({ titleEn: value })} />
                    <Field label="Title AR" value={settings.aboutPage.hero.titleAr} onChange={(value) => updateAboutHero({ titleAr: value })} dir="rtl" />
                    <TextAreaField label="Description EN" value={settings.aboutPage.hero.descriptionEn} onChange={(value) => updateAboutHero({ descriptionEn: value })} />
                    <TextAreaField label="Description AR" value={settings.aboutPage.hero.descriptionAr} onChange={(value) => updateAboutHero({ descriptionAr: value })} dir="rtl" />
                    <TextAreaField label="Supporting text EN" value={settings.aboutPage.hero.supportingTextEn} onChange={(value) => updateAboutHero({ supportingTextEn: value })} />
                    <TextAreaField label="Supporting text AR" value={settings.aboutPage.hero.supportingTextAr} onChange={(value) => updateAboutHero({ supportingTextAr: value })} dir="rtl" />
                    <ImageUrlDropzone label={isAr ? "ØµÙˆØ±Ø© Ø§Ù„Ù‡ÙŠØ±Ùˆ" : "Hero image"} value={settings.aboutPage.hero.imageUrl} onChange={(value) => updateAboutHero({ imageUrl: value })} className="md:col-span-2" previewClassName="bg-slate-50" />
                    <Field label="Image alt EN" value={settings.aboutPage.hero.imageAltEn} onChange={(value) => updateAboutHero({ imageAltEn: value })} />
                    <Field label="Image alt AR" value={settings.aboutPage.hero.imageAltAr} onChange={(value) => updateAboutHero({ imageAltAr: value })} dir="rtl" />
                    <Field label="Breadcrumb EN" value={settings.aboutPage.hero.breadcrumbEn} onChange={(value) => updateAboutHero({ breadcrumbEn: value })} />
                    <Field label="Breadcrumb AR" value={settings.aboutPage.hero.breadcrumbAr} onChange={(value) => updateAboutHero({ breadcrumbAr: value })} dir="rtl" />
                  </div>
                  <AboutPreviewCard settings={settings.aboutPage} section="hero" isAr={isAr} />
                </div>
              </TabsContent>

              <TabsContent value="overview" className="mt-0">
                <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
                  <div className="space-y-5">
                    <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                      <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ù†Ø¸Ø±Ø© Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØµØ©" : "Platform Overview"}</h3>
                      <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù‚Ø³Ù…" : "Enable section"} checked={!!settings.aboutPage.overview.enabled} onChange={(value) => updateAboutOverview({ enabled: value })} />
                      <Field label="Eyebrow EN" value={settings.aboutPage.overview.eyebrowEn} onChange={(value) => updateAboutOverview({ eyebrowEn: value })} />
                      <Field label="Eyebrow AR" value={settings.aboutPage.overview.eyebrowAr} onChange={(value) => updateAboutOverview({ eyebrowAr: value })} dir="rtl" />
                      <Field label="Heading EN" value={settings.aboutPage.overview.headingEn} onChange={(value) => updateAboutOverview({ headingEn: value })} />
                      <Field label="Heading AR" value={settings.aboutPage.overview.headingAr} onChange={(value) => updateAboutOverview({ headingAr: value })} dir="rtl" />
                      <TextAreaField label="Description EN" value={settings.aboutPage.overview.descriptionEn} onChange={(value) => updateAboutOverview({ descriptionEn: value })} />
                      <TextAreaField label="Description AR" value={settings.aboutPage.overview.descriptionAr} onChange={(value) => updateAboutOverview({ descriptionAr: value })} dir="rtl" />
                      <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± CTA" : "Enable CTA"} checked={!!settings.aboutPage.overview.ctaEnabled} onChange={(value) => updateAboutOverview({ ctaEnabled: value })} />
                      <Field label="CTA label EN" value={settings.aboutPage.overview.ctaLabelEn} onChange={(value) => updateAboutOverview({ ctaLabelEn: value })} />
                      <Field label="CTA label AR" value={settings.aboutPage.overview.ctaLabelAr} onChange={(value) => updateAboutOverview({ ctaLabelAr: value })} dir="rtl" />
                      <Field label="CTA URL" value={settings.aboutPage.overview.ctaUrl} onChange={(value) => updateAboutOverview({ ctaUrl: value })} />
                    </div>

                    <div className="grid gap-3 rounded-[22px] bg-white p-4 shadow-sm">
                      <h3 className="text-lg font-black text-[#17172f]">{isAr ? "Ù†Ù‚Ø§Ø· Ø§Ù„Ù‚ÙŠÙ…Ø©" : "Value points"}</h3>
                      {settings.aboutPage.overview.valuePoints.slice(0, 3).map((point, index) => (
                        <div key={point.id} className="grid gap-3 rounded-[20px] border border-slate-100 p-4 md:grid-cols-2">
                          <Field label={`Point ${index + 1} EN`} value={point.textEn} onChange={(value) => updateAboutValuePoints(settings.aboutPage.overview.valuePoints.map((item) => item.id === point.id ? { ...item, textEn: value } : item))} />
                          <Field label={`Point ${index + 1} AR`} value={point.textAr} onChange={(value) => updateAboutValuePoints(settings.aboutPage.overview.valuePoints.map((item) => item.id === point.id ? { ...item, textAr: value } : item))} dir="rtl" />
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 rounded-[22px] bg-white p-4 shadow-sm">
                      <h3 className="text-lg font-black text-[#17172f]">{isAr ? "ØµÙˆØ± Ø§Ù„ÙƒÙˆÙ„Ø§Ø¬" : "Collage images"}</h3>
                      {settings.aboutPage.overview.images.slice(0, 3).map((image, index) => (
                        <div key={image.id} className="grid gap-3 rounded-[20px] border border-slate-100 p-4 md:grid-cols-2">
                          <ImageUrlDropzone label={`${isAr ? "ØµÙˆØ±Ø©" : "Image"} ${index + 1}`} value={image.imageUrl} onChange={(value) => updateAboutImages(settings.aboutPage.overview.images.map((item) => item.id === image.id ? { ...item, imageUrl: value } : item))} />
                          <div className="grid gap-3">
                            <Field label="Alt EN" value={image.altEn} onChange={(value) => updateAboutImages(settings.aboutPage.overview.images.map((item) => item.id === image.id ? { ...item, altEn: value } : item))} />
                            <Field label="Alt AR" value={image.altAr} onChange={(value) => updateAboutImages(settings.aboutPage.overview.images.map((item) => item.id === image.id ? { ...item, altAr: value } : item))} dir="rtl" />
                            <Button variant="outline" onClick={() => updateAboutImages(settings.aboutPage.overview.images.map((item) => item.id === image.id ? { ...item, imageUrl: "" } : item))} className="h-10 rounded-2xl font-extrabold text-red-600">
                              <Trash2 className="h-4 w-4" />
                              {isAr ? "Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØµÙˆØ±Ø©" : "Remove image"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <AboutPreviewCard settings={settings.aboutPage} section="overview" isAr={isAr} />
                </div>
              </TabsContent>

              <TabsContent value="ecosystem" className="mt-0">
                <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
                  <div className="space-y-5">
                    <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                      <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ù…Ù†Ø¸ÙˆÙ…Ø© Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª" : "Event Ecosystem"}</h3>
                      <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù‚Ø³Ù…" : "Enable section"} checked={!!settings.aboutPage.ecosystem.enabled} onChange={(value) => updateAboutEcosystem({ enabled: value })} />
                      <Field label="Eyebrow EN" value={settings.aboutPage.ecosystem.eyebrowEn} onChange={(value) => updateAboutEcosystem({ eyebrowEn: value })} />
                      <Field label="Eyebrow AR" value={settings.aboutPage.ecosystem.eyebrowAr} onChange={(value) => updateAboutEcosystem({ eyebrowAr: value })} dir="rtl" />
                      <Field label="Heading EN" value={settings.aboutPage.ecosystem.headingEn} onChange={(value) => updateAboutEcosystem({ headingEn: value })} />
                      <Field label="Heading AR" value={settings.aboutPage.ecosystem.headingAr} onChange={(value) => updateAboutEcosystem({ headingAr: value })} dir="rtl" />
                      <TextAreaField label="Description EN" value={settings.aboutPage.ecosystem.descriptionEn} onChange={(value) => updateAboutEcosystem({ descriptionEn: value })} />
                      <TextAreaField label="Description AR" value={settings.aboutPage.ecosystem.descriptionAr} onChange={(value) => updateAboutEcosystem({ descriptionAr: value })} dir="rtl" />
                    </div>

                    <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black text-[#17172f]">{isAr ? "ÙƒØ±ÙˆØª Ø§Ù„Ù‚Ø¯Ø±Ø§Øª" : "Capability cards"}</h3>
                        <Button variant="outline" onClick={() => updateAboutCapabilityCards([...settings.aboutPage.ecosystem.cards, { id: `about-card-${Date.now()}`, enabled: true, icon: "calendar", titleEn: "New Capability", titleAr: "Ù‚Ø¯Ø±Ø© Ø¬Ø¯ÙŠØ¯Ø©", descriptionEn: "", descriptionAr: "" }])} disabled={settings.aboutPage.ecosystem.cards.length >= 6} className="h-10 rounded-2xl font-extrabold">
                          <Plus className="h-4 w-4" />
                          {isAr ? "Ø¥Ø¶Ø§ÙØ© ÙƒØ§Ø±Øª" : "Add card"}
                        </Button>
                      </div>
                      {settings.aboutPage.ecosystem.cards.map((card, index) => (
                        <div key={card.id} className="grid gap-3 rounded-[20px] border border-slate-100 p-4 md:grid-cols-2">
                          <div className="md:col-span-2 flex items-center justify-between gap-3">
                            <ToggleCard label={isAr ? "Ø¸Ø§Ù‡Ø±" : "Visible"} checked={card.enabled} onChange={(value) => updateAboutCapabilityCards(settings.aboutPage.ecosystem.cards.map((item) => item.id === card.id ? { ...item, enabled: value } : item))} />
                            <div className="flex gap-1">
                              <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} icon={ArrowUp} disabled={index === 0} onClick={() => {
                                const cards = [...settings.aboutPage.ecosystem.cards]
                                const [item] = cards.splice(index, 1)
                                cards.splice(index - 1, 0, item)
                                updateAboutCapabilityCards(cards)
                              }} />
                              <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} icon={ArrowDown} disabled={index === settings.aboutPage.ecosystem.cards.length - 1} onClick={() => {
                                const cards = [...settings.aboutPage.ecosystem.cards]
                                const [item] = cards.splice(index, 1)
                                cards.splice(index + 1, 0, item)
                                updateAboutCapabilityCards(cards)
                              }} />
                              <IconButton label={adminT(language, "common.delete")} icon={Trash2} tone="danger" onClick={() => updateAboutCapabilityCards(settings.aboutPage.ecosystem.cards.filter((item) => item.id !== card.id))} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500">Icon</Label>
                            <Select value={card.icon} onValueChange={(value) => updateAboutCapabilityCards(settings.aboutPage.ecosystem.cards.map((item) => item.id === card.id ? { ...item, icon: value as AboutCapabilityCard["icon"] } : item))}>
                              <SelectTrigger className="h-11 rounded-xl bg-slate-50/50"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="calendar">Calendar</SelectItem>
                                <SelectItem value="ticket">Ticket</SelectItem>
                                <SelectItem value="qrCode">QR Code</SelectItem>
                                <SelectItem value="mail">Mail</SelectItem>
                                <SelectItem value="barChart">Reports</SelectItem>
                                <SelectItem value="users">Users</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Field label="Title EN" value={card.titleEn} onChange={(value) => updateAboutCapabilityCards(settings.aboutPage.ecosystem.cards.map((item) => item.id === card.id ? { ...item, titleEn: value } : item))} />
                          <Field label="Title AR" value={card.titleAr} onChange={(value) => updateAboutCapabilityCards(settings.aboutPage.ecosystem.cards.map((item) => item.id === card.id ? { ...item, titleAr: value } : item))} dir="rtl" />
                          <TextAreaField label="Description EN" value={card.descriptionEn} onChange={(value) => updateAboutCapabilityCards(settings.aboutPage.ecosystem.cards.map((item) => item.id === card.id ? { ...item, descriptionEn: value } : item))} />
                          <TextAreaField label="Description AR" value={card.descriptionAr} onChange={(value) => updateAboutCapabilityCards(settings.aboutPage.ecosystem.cards.map((item) => item.id === card.id ? { ...item, descriptionAr: value } : item))} dir="rtl" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <AboutPreviewCard settings={settings.aboutPage} section="ecosystem" isAr={isAr} />
                </div>
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
                  <div className="space-y-5">
                    <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                      <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ù‚Ø³Ù… Ø§Ù„ÙØ±ÙŠÙ‚" : "Team Section"}</h3>
                      <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù‚Ø³Ù…" : "Enable section"} checked={!!settings.aboutPage.team.enabled} onChange={(value) => updateAboutTeam({ enabled: value })} />
                      <Field label="Eyebrow EN" value={settings.aboutPage.team.eyebrowEn} onChange={(value) => updateAboutTeam({ eyebrowEn: value })} />
                      <Field label="Eyebrow AR" value={settings.aboutPage.team.eyebrowAr} onChange={(value) => updateAboutTeam({ eyebrowAr: value })} dir="rtl" />
                      <Field label="Heading EN" value={settings.aboutPage.team.headingEn} onChange={(value) => updateAboutTeam({ headingEn: value })} />
                      <Field label="Heading AR" value={settings.aboutPage.team.headingAr} onChange={(value) => updateAboutTeam({ headingAr: value })} dir="rtl" />
                      <TextAreaField label="Description EN" value={settings.aboutPage.team.descriptionEn} onChange={(value) => updateAboutTeam({ descriptionEn: value })} />
                      <TextAreaField label="Description AR" value={settings.aboutPage.team.descriptionAr} onChange={(value) => updateAboutTeam({ descriptionAr: value })} dir="rtl" />
                    </div>

                    <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-[#17172f]">{isAr ? "Ø£Ø¹Ø¶Ø§Ø¡ Ø§Ù„ÙØ±ÙŠÙ‚" : "Team members"}</h3>
                          <p className="mt-1 text-xs font-bold text-slate-400">{isAr ? "Ù„Ù† ÙŠØ¸Ù‡Ø± Ø§Ù„Ù‚Ø³Ù… ÙÙŠ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø¥Ù„Ø§ Ø¨Ø¹Ø¯ Ø¥Ø¶Ø§ÙØ© Ø£Ø¹Ø¶Ø§Ø¡ Ø­Ù‚ÙŠÙ‚ÙŠÙŠÙ† ÙˆØªÙØ¹ÙŠÙ„Ù‡." : "The public section stays hidden until real enabled members are added."}</p>
                        </div>
                        <Button variant="outline" onClick={() => updateAboutTeamMembers([...settings.aboutPage.team.members, { id: `about-team-${Date.now()}`, enabled: true, imageUrl: "", imageAltEn: "", imageAltAr: "", nameEn: "", nameAr: "", jobTitleEn: "", jobTitleAr: "", bioEn: "", bioAr: "", linkedinUrl: "", email: "" }])} disabled={settings.aboutPage.team.members.length >= 12} className="h-10 rounded-2xl font-extrabold">
                          <Plus className="h-4 w-4" />
                          {isAr ? "Ø¥Ø¶Ø§ÙØ© Ø¹Ø¶Ùˆ" : "Add member"}
                        </Button>
                      </div>
                      {settings.aboutPage.team.members.length === 0 ? (
                        <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-400">
                          {isAr ? "Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø£Ø¹Ø¶Ø§Ø¡ ÙØ±ÙŠÙ‚ Ù…Ø¶Ø§ÙÙŠÙ† Ø­Ø§Ù„ÙŠØ§." : "No team members have been added yet."}
                        </div>
                      ) : null}
                      {settings.aboutPage.team.members.map((member, index) => (
                        <div key={member.id} className="grid gap-3 rounded-[20px] border border-slate-100 p-4 md:grid-cols-2">
                          <div className="md:col-span-2 flex items-center justify-between gap-3">
                            <ToggleCard label={isAr ? "Ø¸Ø§Ù‡Ø±" : "Visible"} checked={member.enabled} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, enabled: value } : item))} />
                            <div className="flex gap-1">
                              <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} icon={ArrowUp} disabled={index === 0} onClick={() => {
                                const members = [...settings.aboutPage.team.members]
                                const [item] = members.splice(index, 1)
                                members.splice(index - 1, 0, item)
                                updateAboutTeamMembers(members)
                              }} />
                              <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} icon={ArrowDown} disabled={index === settings.aboutPage.team.members.length - 1} onClick={() => {
                                const members = [...settings.aboutPage.team.members]
                                const [item] = members.splice(index, 1)
                                members.splice(index + 1, 0, item)
                                updateAboutTeamMembers(members)
                              }} />
                              <IconButton label={adminT(language, "common.delete")} icon={Trash2} tone="danger" onClick={() => updateAboutTeamMembers(settings.aboutPage.team.members.filter((item) => item.id !== member.id))} />
                            </div>
                          </div>
                          <ImageUrlDropzone label={isAr ? "ØµÙˆØ±Ø© Ø§Ù„Ø¹Ø¶Ùˆ" : "Profile image"} value={member.imageUrl} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, imageUrl: value } : item))} className="md:col-span-2" previewClassName="bg-slate-50" />
                          <Field label="Name EN" value={member.nameEn} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, nameEn: value } : item))} />
                          <Field label="Name AR" value={member.nameAr} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, nameAr: value } : item))} dir="rtl" />
                          <Field label="Job title EN" value={member.jobTitleEn} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, jobTitleEn: value } : item))} />
                          <Field label="Job title AR" value={member.jobTitleAr} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, jobTitleAr: value } : item))} dir="rtl" />
                          <TextAreaField label="Short bio EN" value={member.bioEn} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, bioEn: value } : item))} />
                          <TextAreaField label="Short bio AR" value={member.bioAr} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, bioAr: value } : item))} dir="rtl" />
                          <Field label="Image alt EN" value={member.imageAltEn} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, imageAltEn: value } : item))} />
                          <Field label="Image alt AR" value={member.imageAltAr} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, imageAltAr: value } : item))} dir="rtl" />
                          <Field label="LinkedIn URL" value={member.linkedinUrl} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, linkedinUrl: value } : item))} />
                          <Field label="Email" value={member.email} onChange={(value) => updateAboutTeamMembers(settings.aboutPage.team.members.map((item) => item.id === member.id ? { ...item, email: value } : item))} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <AboutPreviewCard settings={settings.aboutPage} section="team" isAr={isAr} />
                </div>
              </TabsContent>

              <TabsContent value="vision" className="mt-0">
                <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
                  <div className="space-y-5">
                    <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                      <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ø§Ù„Ø±Ø¤ÙŠØ© ÙˆØ§Ù„Ù…Ø¨Ø§Ø¯Ø¦" : "Vision & Principles"}</h3>
                      <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù‚Ø³Ù…" : "Enable section"} checked={!!settings.aboutPage.vision.enabled} onChange={(value) => updateAboutVision({ enabled: value })} />
                      <Field label="Eyebrow EN" value={settings.aboutPage.vision.eyebrowEn} onChange={(value) => updateAboutVision({ eyebrowEn: value })} />
                      <Field label="Eyebrow AR" value={settings.aboutPage.vision.eyebrowAr} onChange={(value) => updateAboutVision({ eyebrowAr: value })} dir="rtl" />
                      <Field label="Heading EN" value={settings.aboutPage.vision.headingEn} onChange={(value) => updateAboutVision({ headingEn: value })} />
                      <Field label="Heading AR" value={settings.aboutPage.vision.headingAr} onChange={(value) => updateAboutVision({ headingAr: value })} dir="rtl" />
                      <TextAreaField label="Description EN" value={settings.aboutPage.vision.descriptionEn} onChange={(value) => updateAboutVision({ descriptionEn: value })} />
                      <TextAreaField label="Description AR" value={settings.aboutPage.vision.descriptionAr} onChange={(value) => updateAboutVision({ descriptionAr: value })} dir="rtl" />
                      <ImageUrlDropzone label={isAr ? "ØµÙˆØ±Ø© Ø§Ù„Ø±Ø¤ÙŠØ©" : "Vision image"} value={settings.aboutPage.vision.imageUrl} onChange={(value) => updateAboutVision({ imageUrl: value })} className="md:col-span-2" previewClassName="bg-slate-50" />
                      <Field label="Image alt EN" value={settings.aboutPage.vision.imageAltEn} onChange={(value) => updateAboutVision({ imageAltEn: value })} />
                      <Field label="Image alt AR" value={settings.aboutPage.vision.imageAltAr} onChange={(value) => updateAboutVision({ imageAltAr: value })} dir="rtl" />
                      <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± CTA" : "Enable CTA"} checked={!!settings.aboutPage.vision.ctaEnabled} onChange={(value) => updateAboutVision({ ctaEnabled: value })} />
                      <Field label="CTA label EN" value={settings.aboutPage.vision.ctaLabelEn} onChange={(value) => updateAboutVision({ ctaLabelEn: value })} />
                      <Field label="CTA label AR" value={settings.aboutPage.vision.ctaLabelAr} onChange={(value) => updateAboutVision({ ctaLabelAr: value })} dir="rtl" />
                      <Field label="CTA URL" value={settings.aboutPage.vision.ctaUrl} onChange={(value) => updateAboutVision({ ctaUrl: value })} />
                    </div>

                    <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black text-[#17172f]">{isAr ? "Ø§Ù„Ù…Ø¨Ø§Ø¯Ø¦" : "Principles"}</h3>
                        <Button variant="outline" onClick={() => updateAboutPrinciples([...settings.aboutPage.vision.principles, { id: `about-principle-${Date.now()}`, textEn: "New principle", textAr: "Ù…Ø¨Ø¯Ø£ Ø¬Ø¯ÙŠØ¯" }])} disabled={settings.aboutPage.vision.principles.length >= 6} className="h-10 rounded-2xl font-extrabold">
                          <Plus className="h-4 w-4" />
                          {isAr ? "Ø¥Ø¶Ø§ÙØ© Ù…Ø¨Ø¯Ø£" : "Add principle"}
                        </Button>
                      </div>
                      {settings.aboutPage.vision.principles.map((principle, index) => (
                        <div key={principle.id} className="grid gap-3 rounded-[20px] border border-slate-100 p-4 md:grid-cols-[1fr_1fr_auto]">
                          <Field label={`Principle ${index + 1} EN`} value={principle.textEn} onChange={(value) => updateAboutPrinciples(settings.aboutPage.vision.principles.map((item) => item.id === principle.id ? { ...item, textEn: value } : item))} />
                          <Field label={`Principle ${index + 1} AR`} value={principle.textAr} onChange={(value) => updateAboutPrinciples(settings.aboutPage.vision.principles.map((item) => item.id === principle.id ? { ...item, textAr: value } : item))} dir="rtl" />
                          <div className="flex items-end gap-1">
                            <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} icon={ArrowUp} disabled={index === 0} onClick={() => {
                              const principles = [...settings.aboutPage.vision.principles]
                              const [item] = principles.splice(index, 1)
                              principles.splice(index - 1, 0, item)
                              updateAboutPrinciples(principles)
                            }} />
                            <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} icon={ArrowDown} disabled={index === settings.aboutPage.vision.principles.length - 1} onClick={() => {
                              const principles = [...settings.aboutPage.vision.principles]
                              const [item] = principles.splice(index, 1)
                              principles.splice(index + 1, 0, item)
                              updateAboutPrinciples(principles)
                            }} />
                            <IconButton label={adminT(language, "common.delete")} icon={Trash2} tone="danger" onClick={() => updateAboutPrinciples(settings.aboutPage.vision.principles.filter((item) => item.id !== principle.id))} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <AboutPreviewCard settings={settings.aboutPage} section="vision" isAr={isAr} />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
<TabsContent value="contact" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
              <div className="space-y-5">
                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">Contact Hero</h3>
                  <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù‡ÙŠØ±Ùˆ" : "Enable hero"} checked={!!settings.contactPage.hero.enabled} onChange={(value) => updateContactHero({ enabled: value })} />
                  <Field label="Eyebrow EN" value={settings.contactPage.hero.eyebrowEn} onChange={(value) => updateContactHero({ eyebrowEn: value })} />
                  <Field label="Title EN" value={settings.contactPage.hero.titleEn} onChange={(value) => updateContactHero({ titleEn: value })} />
                  <Field label="Title AR" value={settings.contactPage.hero.titleAr} onChange={(value) => updateContactHero({ titleAr: value })} />
                  <TextAreaField label="Description EN" value={settings.contactPage.hero.descriptionEn} onChange={(value) => updateContactHero({ descriptionEn: value })} />
                  <TextAreaField label="Description AR" value={settings.contactPage.hero.descriptionAr} onChange={(value) => updateContactHero({ descriptionAr: value })} />
                  <Field label="Supporting text EN" value={settings.contactPage.hero.supportingTextEn} onChange={(value) => updateContactHero({ supportingTextEn: value })} />
                  <Field label="Supporting text AR" value={settings.contactPage.hero.supportingTextAr} onChange={(value) => updateContactHero({ supportingTextAr: value })} />
                  <Field label="Primary CTA EN" value={settings.contactPage.hero.primaryCtaEn} onChange={(value) => updateContactHero({ primaryCtaEn: value })} />
                  <Field label="Secondary CTA EN" value={settings.contactPage.hero.secondaryCtaEn} onChange={(value) => updateContactHero({ secondaryCtaEn: value })} />
                  <ImageUrlDropzone label={isAr ? "ØµÙˆØ±Ø© Ø§Ù„Ù‡ÙŠØ±Ùˆ" : "Hero image"} value={settings.contactPage.hero.imageUrl} onChange={(value) => updateContactHero({ imageUrl: value })} previewClassName="bg-slate-50" />
                  <Field label="Image alt EN" value={settings.contactPage.hero.imageAltEn} onChange={(value) => updateContactHero({ imageAltEn: value })} />
                </div>

                <div className="space-y-4 rounded-[22px] bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-black text-[#17172f]">{isAr ? "ÙƒØ±ÙˆØª Ø§Ù„ØªÙˆØ§ØµÙ„" : "Contact Cards"}</h3>
                  {settings.contactPage.contactCards.slice(0, 4).map((card, index) => (
                    <div key={card.id} className="grid gap-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2">
                      <div className="md:col-span-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-700">{isAr ? "ÙƒØ§Ø±Øª" : "Card"} {index + 1}</p>
                        <ToggleCard label={isAr ? "Ø¸Ø§Ù‡Ø±" : "Visible"} checked={card.enabled} onChange={(value) => updateContactCards(settings.contactPage.contactCards.map((item) => item.id === card.id ? { ...item, enabled: value } : item))} />
                      </div>
                      <Field label="Label EN" value={card.labelEn} onChange={(value) => updateContactCards(settings.contactPage.contactCards.map((item) => item.id === card.id ? { ...item, labelEn: value } : item))} />
                      <Field label="Label AR" value={card.labelAr} onChange={(value) => updateContactCards(settings.contactPage.contactCards.map((item) => item.id === card.id ? { ...item, labelAr: value } : item))} />
                      <Field label="Value" value={card.value} onChange={(value) => updateContactCards(settings.contactPage.contactCards.map((item) => item.id === card.id ? { ...item, value } : item))} />
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500">Icon</Label>
                        <Select value={card.icon} onValueChange={(value) => updateContactCards(settings.contactPage.contactCards.map((item) => item.id === card.id ? { ...item, icon: value as ContactInformationCardSettings["icon"] } : item))}>
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="mail">Email</SelectItem>
                            <SelectItem value="mapPin">Address</SelectItem>
                            <SelectItem value="headphones">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <TextAreaField label="Supporting EN" value={card.supportingTextEn} onChange={(value) => updateContactCards(settings.contactPage.contactCards.map((item) => item.id === card.id ? { ...item, supportingTextEn: value } : item))} />
                      <TextAreaField label="Supporting AR" value={card.supportingTextAr} onChange={(value) => updateContactCards(settings.contactPage.contactCards.map((item) => item.id === card.id ? { ...item, supportingTextAr: value } : item))} />
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500">Link type</Label>
                        <Select value={card.linkType} onValueChange={(value) => updateContactCards(settings.contactPage.contactCards.map((item) => item.id === card.id ? { ...item, linkType: value as ContactInformationCardSettings["linkType"] } : item))}>
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="map">Map</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="external">External</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Field label="Link value" value={card.linkValue} onChange={(value) => updateContactCards(settings.contactPage.contactCards.map((item) => item.id === card.id ? { ...item, linkValue: value } : item))} />
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ù…Ø­ØªÙˆÙ‰ Request Details" : "Request Details Content"}</h3>
                  <ToggleCard label={isAr ? "Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù‚Ø³Ù…" : "Enable section"} checked={!!settings.contactPage.requestSection.enabled} onChange={(value) => updateContactRequest({ enabled: value })} />
                  <Field label="Eyebrow EN" value={settings.contactPage.requestSection.eyebrowEn} onChange={(value) => updateContactRequest({ eyebrowEn: value })} />
                  <Field label="Title EN" value={settings.contactPage.requestSection.titleEn} onChange={(value) => updateContactRequest({ titleEn: value })} />
                  <Field label="Title AR" value={settings.contactPage.requestSection.titleAr} onChange={(value) => updateContactRequest({ titleAr: value })} />
                  <TextAreaField label="Description EN" value={settings.contactPage.requestSection.descriptionEn} onChange={(value) => updateContactRequest({ descriptionEn: value })} />
                  <TextAreaField label="Description AR" value={settings.contactPage.requestSection.descriptionAr} onChange={(value) => updateContactRequest({ descriptionAr: value })} />
                  <Field label="Submit label EN" value={settings.contactPage.requestSection.submitLabelEn} onChange={(value) => updateContactRequest({ submitLabelEn: value })} />
                  <Field label="Submit label AR" value={settings.contactPage.requestSection.submitLabelAr} onChange={(value) => updateContactRequest({ submitLabelAr: value })} />
                  <Field label="Clear label EN" value={settings.contactPage.requestSection.clearLabelEn} onChange={(value) => updateContactRequest({ clearLabelEn: value })} />
                  <Field label="Clear label AR" value={settings.contactPage.requestSection.clearLabelAr} onChange={(value) => updateContactRequest({ clearLabelAr: value })} />
                  <Field label="Sending label EN" value={settings.contactPage.requestSection.sendingLabelEn} onChange={(value) => updateContactRequest({ sendingLabelEn: value })} />
                  <Field label="Sending label AR" value={settings.contactPage.requestSection.sendingLabelAr} onChange={(value) => updateContactRequest({ sendingLabelAr: value })} />
                  <TextAreaField label="Consent label EN" value={settings.contactPage.requestSection.consentLabelEn} onChange={(value) => updateContactRequest({ consentLabelEn: value })} />
                  <TextAreaField label="Consent label AR" value={settings.contactPage.requestSection.consentLabelAr} onChange={(value) => updateContactRequest({ consentLabelAr: value })} />
                </div>

                <div className="space-y-4 rounded-[22px] bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-black text-[#17172f]">{isAr ? "نقاط مختصرة للفورم" : "Concise Benefit Points"}</h3>
                  {settings.contactPage.requestSection.benefits.slice(0, 3).map((benefit, index) => (
                    <div key={benefit.id} className="grid gap-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2">
                      <p className="md:col-span-2 text-sm font-black text-slate-700">{isAr ? "Ù…ÙŠØ²Ø©" : "Benefit"} {index + 1}</p>
                      <Field label="Title EN" value={benefit.titleEn} onChange={(value) => updateContactBenefits(settings.contactPage.requestSection.benefits.map((item) => item.id === benefit.id ? { ...item, titleEn: value } : item))} />
                      <Field label="Title AR" value={benefit.titleAr} onChange={(value) => updateContactBenefits(settings.contactPage.requestSection.benefits.map((item) => item.id === benefit.id ? { ...item, titleAr: value } : item))} />
                      <TextAreaField label="Text EN" value={benefit.textEn} onChange={(value) => updateContactBenefits(settings.contactPage.requestSection.benefits.map((item) => item.id === benefit.id ? { ...item, textEn: value } : item))} />
                      <TextAreaField label="Text AR" value={benefit.textAr} onChange={(value) => updateContactBenefits(settings.contactPage.requestSection.benefits.map((item) => item.id === benefit.id ? { ...item, textAr: value } : item))} />
                    </div>
                  ))}
                </div>

                <div className="space-y-4 rounded-[22px] bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-black text-[#17172f]">{isAr ? "أنواع الاستفسار" : "Inquiry Type Options"}</h3>
                  {settings.contactPage.requestSection.inquiryTypes.map((option, index) => (
                    <div key={option.id} className="grid gap-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-[120px_1fr_1fr_120px]">
                      <ToggleCard label={isAr ? "ظاهر" : "Enabled"} checked={option.enabled} onChange={(value) => updateContactInquiryTypes(settings.contactPage.requestSection.inquiryTypes.map((item) => item.id === option.id ? { ...item, enabled: value } : item))} />
                      <Field label="Value" value={option.value} onChange={(value) => updateContactInquiryTypes(settings.contactPage.requestSection.inquiryTypes.map((item) => item.id === option.id ? { ...item, value: value.replace(/[^a-z0-9_]/gi, "_").toLowerCase() } : item))} />
                      <Field label="Label EN" value={option.labelEn} onChange={(value) => updateContactInquiryTypes(settings.contactPage.requestSection.inquiryTypes.map((item) => item.id === option.id ? { ...item, labelEn: value } : item))} />
                      <Field label="Label AR" value={option.labelAr} onChange={(value) => updateContactInquiryTypes(settings.contactPage.requestSection.inquiryTypes.map((item) => item.id === option.id ? { ...item, labelAr: value } : item))} />
                      <div className="flex items-center gap-2 md:col-span-4">
                        <Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={() => {
                          const next = [...settings.contactPage.requestSection.inquiryTypes]
                          const [item] = next.splice(index, 1)
                          next.splice(index - 1, 0, item)
                          updateContactInquiryTypes(next.map((entry, orderIndex) => ({ ...entry, order: orderIndex + 1 })))
                        }} className="h-9 rounded-xl font-bold"><ArrowUp className="h-4 w-4" /> {isAr ? "أعلى" : "Up"}</Button>
                        <Button type="button" size="sm" variant="outline" disabled={index === settings.contactPage.requestSection.inquiryTypes.length - 1} onClick={() => {
                          const next = [...settings.contactPage.requestSection.inquiryTypes]
                          const [item] = next.splice(index, 1)
                          next.splice(index + 1, 0, item)
                          updateContactInquiryTypes(next.map((entry, orderIndex) => ({ ...entry, order: orderIndex + 1 })))
                        }} className="h-9 rounded-xl font-bold"><ArrowDown className="h-4 w-4" /> {isAr ? "أسفل" : "Down"}</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "عناوين وحقول النموذج" : "Form Labels & Placeholders"}</h3>
                  <Field label="Full name label EN" value={settings.contactPage.requestSection.fieldLabels.fullNameEn} onChange={(value) => updateContactFieldLabels({ fullNameEn: value })} />
                  <Field label="Full name label AR" value={settings.contactPage.requestSection.fieldLabels.fullNameAr} onChange={(value) => updateContactFieldLabels({ fullNameAr: value })} />
                  <Field label="Subject label EN" value={settings.contactPage.requestSection.fieldLabels.subjectEn} onChange={(value) => updateContactFieldLabels({ subjectEn: value })} />
                  <Field label="Subject label AR" value={settings.contactPage.requestSection.fieldLabels.subjectAr} onChange={(value) => updateContactFieldLabels({ subjectAr: value })} />
                  <Field label="Message label EN" value={settings.contactPage.requestSection.fieldLabels.messageEn} onChange={(value) => updateContactFieldLabels({ messageEn: value })} />
                  <Field label="Message label AR" value={settings.contactPage.requestSection.fieldLabels.messageAr} onChange={(value) => updateContactFieldLabels({ messageAr: value })} />
                  <Field label="Subject placeholder EN" value={settings.contactPage.requestSection.placeholders.subjectEn} onChange={(value) => updateContactPlaceholders({ subjectEn: value })} />
                  <Field label="Subject placeholder AR" value={settings.contactPage.requestSection.placeholders.subjectAr} onChange={(value) => updateContactPlaceholders({ subjectAr: value })} />
                  <TextAreaField label="Message placeholder EN" value={settings.contactPage.requestSection.placeholders.messageEn} onChange={(value) => updateContactPlaceholders({ messageEn: value })} />
                  <TextAreaField label="Message placeholder AR" value={settings.contactPage.requestSection.placeholders.messageAr} onChange={(value) => updateContactPlaceholders({ messageAr: value })} />
                </div>

                <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                  <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ù†Ø¬Ø§Ø­" : "Success Message"}</h3>
                  <Field label="Title EN" value={settings.contactPage.successState.titleEn} onChange={(value) => updateContactSuccess({ titleEn: value })} />
                  <Field label="Title AR" value={settings.contactPage.successState.titleAr} onChange={(value) => updateContactSuccess({ titleAr: value })} />
                  <TextAreaField label="Description EN" value={settings.contactPage.successState.descriptionEn} onChange={(value) => updateContactSuccess({ descriptionEn: value })} />
                  <TextAreaField label="Description AR" value={settings.contactPage.successState.descriptionAr} onChange={(value) => updateContactSuccess({ descriptionAr: value })} />
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className={cn("overflow-hidden rounded-[22px] bg-slate-950 text-white shadow-sm", isAr && "text-right")} dir={isAr ? "rtl" : "ltr"}>
                  <div className="relative min-h-[220px] p-5">
                    {settings.contactPage.hero.imageUrl ? (
                      <img src={apiAssetUrl(settings.contactPage.hero.imageUrl)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
                    ) : null}
                    <div className="relative">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">{isAr ? settings.contactPage.hero.eyebrowAr : settings.contactPage.hero.eyebrowEn}</p>
                      <h3 className="mt-4 text-3xl font-black leading-tight">{isAr ? settings.contactPage.hero.titleAr : settings.contactPage.hero.titleEn}</h3>
                      <p className="mt-3 text-sm font-semibold leading-6 text-white/75">{isAr ? settings.contactPage.hero.descriptionAr : settings.contactPage.hero.descriptionEn}</p>
                    </div>
                  </div>
                  <div className="grid gap-2 bg-white p-4 text-slate-900">
                    {settings.contactPage.contactCards.filter((card) => card.enabled).slice(0, 4).map((card) => (
                      <div key={card.id} className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-black text-[hsl(var(--primary))]">{isAr ? card.labelAr : card.labelEn}</p>
                        <p className="mt-1 text-sm font-extrabold">{card.value}</p>
                      </div>
                    ))}
                    <div className="rounded-2xl bg-[hsl(var(--primary))] p-4 text-white">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/70">{isAr ? settings.contactPage.requestSection.eyebrowAr : settings.contactPage.requestSection.eyebrowEn}</p>
                      <p className="mt-2 text-xl font-black">{isAr ? settings.contactPage.requestSection.titleAr : settings.contactPage.requestSection.titleEn}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
<TabsContent value="upcoming" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <ToggleCard label={isAr ? "ØªÙ…ÙƒÙŠÙ† Ù‚Ø³Ù… Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©" : "Enable Upcoming Events"} checked={!!settings.upcomingEvents?.enabled} onChange={(v) => updateUpcoming({ enabled: v })} />
                <Field label={isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Eyebrow (English)"} value={settings.upcomingEvents?.eyebrowEn || ''} onChange={(value) => updateUpcoming({ eyebrowEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¹Ø±Ø¨ÙŠ)" : "Eyebrow (Arabic)"}</Label>
                  <Input value={settings.upcomingEvents?.eyebrowAr || ''} onChange={(e) => updateUpcoming({ eyebrowAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Title (English)"} value={settings.upcomingEvents?.titleEn || ''} onChange={(value) => updateUpcoming({ titleEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Title (Arabic)"}</Label>
                  <Input value={settings.upcomingEvents?.titleAr || ''} onChange={(e) => updateUpcoming({ titleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Description (English)"} value={settings.upcomingEvents?.descriptionEn || ''} onChange={(value) => updateUpcoming({ descriptionEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Description (Arabic)"}</Label>
                  <Textarea value={settings.upcomingEvents?.descriptionAr || ''} onChange={(e) => updateUpcoming({ descriptionAr: e.target.value })} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                </div>
                <Field label={isAr ? "Ù†Øµ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© ÙØ§Ø±ØºØ© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Empty title (English)"} value={settings.upcomingEvents?.emptyTitleEn || ''} onChange={(value) => updateUpcoming({ emptyTitleEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "Ù†Øµ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© ÙØ§Ø±ØºØ© (Ø¹Ø±Ø¨ÙŠ)" : "Empty title (Arabic)"}</Label>
                  <Input value={settings.upcomingEvents?.emptyTitleAr || ''} onChange={(e) => updateUpcoming({ emptyTitleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "ØªØ±ØªÙŠØ¨ Ø§Ù„Ø¹Ø±Ø¶" : "Sort Mode"}</Label>
                  <Select value={settings.upcomingEvents?.sortMode || 'default'} onValueChange={(value) => updateUpcoming({ sortMode: value as any })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{isAr ? "Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ" : "Default"}</SelectItem>
                      <SelectItem value="nearest">{isAr ? "Ø§Ù„Ø£Ù‚Ø±Ø¨" : "Nearest"}</SelectItem>
                      <SelectItem value="latest">{isAr ? "Ø§Ù„Ø£Ø­Ø¯Ø«" : "Latest"}</SelectItem>
                      <SelectItem value="oldest">{isAr ? "Ø§Ù„Ø£Ù‚Ø¯Ù…" : "Oldest"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label={isAr ? "Ø§Ù„Ø¹Ù†Ø§ØµØ± ÙÙŠ Ø§Ù„ØµÙØ­Ø©" : "Items per page"} value={String(settings.upcomingEvents?.itemsPerPage || 24)} onChange={(value) => updateUpcoming({ itemsPerPage: Number(value) })} />
              </div>
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm">
                <h4 className="font-extrabold text-[#17172f]">{isAr ? "Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙŠ" : "Informational Section"}</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <ToggleCard label={isAr ? "ØªÙ…ÙƒÙŠÙ† Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙŠ" : "Enable informational section"} checked={!!settings.upcomingEvents?.informationSection?.enabled} onChange={(v) => updateUpcomingInfo({ enabled: v })} />
                  <Field label={isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Badge / Eyebrow (English)"} value={settings.upcomingEvents?.informationSection?.badgeEn || ''} onChange={(v) => updateUpcomingInfo({ badgeEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¹Ø±Ø¨ÙŠ)" : "Badge / Eyebrow (Arabic)"}</Label>
                    <Input value={settings.upcomingEvents?.informationSection?.badgeAr || ''} onChange={(e) => updateUpcomingInfo({ badgeAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Heading (English)"} value={settings.upcomingEvents?.informationSection?.titleEn || ''} onChange={(v) => updateUpcomingInfo({ titleEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Heading (Arabic)"}</Label>
                    <Input value={settings.upcomingEvents?.informationSection?.titleAr || ''} onChange={(e) => updateUpcomingInfo({ titleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Description (English)"} value={settings.upcomingEvents?.informationSection?.descriptionEn || ''} onChange={(v) => updateUpcomingInfo({ descriptionEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Description (Arabic)"}</Label>
                    <Textarea value={settings.upcomingEvents?.informationSection?.descriptionAr || ''} onChange={(e) => updateUpcomingInfo({ descriptionAr: e.target.value })} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <ImageUrlDropzone label={isAr ? "ØµÙˆØ±Ø© Ø§Ù„Ù‚Ø³Ù…" : "Section image"} value={settings.upcomingEvents?.informationSection?.imageUrl || ''} onChange={(v) => updateUpcomingInfo({ imageUrl: v })} />
                  <Field label={isAr ? "Alt Ù†Øµ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Image alt (English)"} value={settings.upcomingEvents?.informationSection?.imageAltEn || ''} onChange={(v) => updateUpcomingInfo({ imageAltEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Alt Ù†Øµ (Ø¹Ø±Ø¨ÙŠ)" : "Image alt (Arabic)"}</Label>
                    <Input value={settings.upcomingEvents?.informationSection?.imageAltAr || ''} onChange={(e) => updateUpcomingInfo({ imageAltAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "Ù…ÙˆØ¶Ø¹ Ø§Ù„ØµÙˆØ±Ø©" : "Image position"}</Label>
                    <Select value={settings.upcomingEvents?.informationSection?.imagePosition || 'left'} onValueChange={(value) => updateUpcomingInfo({ imagePosition: value as any })}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">{isAr ? "ÙŠØ³Ø§Ø±" : "Left"}</SelectItem>
                        <SelectItem value="right">{isAr ? "ÙŠÙ…ÙŠÙ†" : "Right"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-extrabold">{isAr ? "Ø§Ù„Ù†Ù‚Ø§Ø·" : "Bullet items"}</h5>
                  <div className="space-y-3 mt-3">
                    {(settings.upcomingEvents?.informationSection?.bullets || []).map((b, i) => (
                      <div key={b.id} className="grid gap-2 md:grid-cols-[1fr_auto] items-start">
                        <div className="grid gap-2">
                          <Field label={isAr ? `Ø§Ù„Ù†Ù‚Ø·Ø© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ) #${i+1}` : `Bullet (English) #${i+1}`} value={b.textEn} onChange={(v) => setSettings(s => ({ ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: (s.upcomingEvents?.informationSection?.bullets||[]).map(x => x.id === b.id ? { ...x, textEn: v } : x) } } } as SiteContentSettings))} />
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500">{isAr ? `Ø§Ù„Ù†Ù‚Ø·Ø© (Ø¹Ø±Ø¨ÙŠ) #${i+1}` : `Bullet (Arabic) #${i+1}`}</Label>
                            <Input value={b.textAr} onChange={(e) => setSettings(s => ({ ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: (s.upcomingEvents?.informationSection?.bullets||[]).map(x => x.id === b.id ? { ...x, textAr: e.target.value } : x) } } } as SiteContentSettings))} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} onClick={() => setSettings(s => {
                              const arr = (s.upcomingEvents?.informationSection?.bullets || []).slice();
                              const idx = arr.findIndex(x => x.id === b.id);
                              if (idx <= 0) return s;
                              const [it] = arr.splice(idx,1);
                              arr.splice(idx-1,0,it);
                              return { ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: arr } } } as SiteContentSettings;
                            })} icon={ArrowUp} />
                            <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} onClick={() => setSettings(s => {
                              const arr = (s.upcomingEvents?.informationSection?.bullets || []).slice();
                              const idx = arr.findIndex(x => x.id === b.id);
                              if (idx < 0 || idx === arr.length-1) return s;
                              const [it] = arr.splice(idx,1);
                              arr.splice(idx+1,0,it);
                              return { ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: arr } } } as SiteContentSettings;
                            })} icon={ArrowDown} />
                          </div>
                          <IconButton label={adminT(language, "common.delete")} onClick={() => setSettings(s => ({ ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: (s.upcomingEvents?.informationSection?.bullets||[]).filter(x => x.id !== b.id) } } } as SiteContentSettings))} icon={Trash2} tone="danger" />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => setSettings(s => ({ ...s, upcomingEvents: { ...(s.upcomingEvents||{}), informationSection: { ...(s.upcomingEvents?.informationSection||{}), bullets: [...(s.upcomingEvents?.informationSection?.bullets||[]), { id: `b-${Date.now()}`, textEn: 'New bullet', textAr: 'Ù†Ù‚Ø·Ø© Ø¬Ø¯ÙŠØ¯Ø©' }] } } } as SiteContentSettings))} className="h-11 rounded-2xl font-extrabold w-full">
                      <Plus className="h-4 w-4" />
                      {isAr ? 'Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø©' : 'Add bullet'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
<TabsContent value="previous" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <ToggleCard label={isAr ? "ØªÙ…ÙƒÙŠÙ† Ù‚Ø³Ù… Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©" : "Enable Previous Events"} checked={!!settings.previousEvents?.enabled} onChange={(v) => updatePrevious({ enabled: v })} />
                <Field label={isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Eyebrow (English)"} value={settings.previousEvents?.eyebrowEn || ''} onChange={(value) => updatePrevious({ eyebrowEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¹Ø±Ø¨ÙŠ)" : "Eyebrow (Arabic)"}</Label>
                  <Input value={settings.previousEvents?.eyebrowAr || ''} onChange={(e) => updatePrevious({ eyebrowAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Title (English)"} value={settings.previousEvents?.titleEn || ''} onChange={(value) => updatePrevious({ titleEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Title (Arabic)"}</Label>
                  <Input value={settings.previousEvents?.titleAr || ''} onChange={(e) => updatePrevious({ titleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Description (English)"} value={settings.previousEvents?.descriptionEn || ''} onChange={(value) => updatePrevious({ descriptionEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Description (Arabic)"}</Label>
                  <Textarea value={settings.previousEvents?.descriptionAr || ''} onChange={(e) => updatePrevious({ descriptionAr: e.target.value })} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                </div>
                <Field label={isAr ? "Ù†Øµ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© ÙØ§Ø±ØºØ© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Empty title (English)"} value={settings.previousEvents?.emptyTitleEn || ''} onChange={(value) => updatePrevious({ emptyTitleEn: value })} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">{isAr ? "Ù†Øµ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© ÙØ§Ø±ØºØ© (Ø¹Ø±Ø¨ÙŠ)" : "Empty title (Arabic)"}</Label>
                  <Input value={settings.previousEvents?.emptyTitleAr || ''} onChange={(e) => updatePrevious({ emptyTitleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "ØªØ±ØªÙŠØ¨ Ø§Ù„Ø¹Ø±Ø¶" : "Sort Mode"}</Label>
                  <Select value={settings.previousEvents?.sortMode || 'nearest'} onValueChange={(value) => updatePrevious({ sortMode: value as any })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{isAr ? "Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ" : "Default"}</SelectItem>
                      <SelectItem value="nearest">{isAr ? "Ø§Ù„Ø£Ù‚Ø±Ø¨" : "Nearest"}</SelectItem>
                      <SelectItem value="latest">{isAr ? "Ø§Ù„Ø£Ø­Ø¯Ø«" : "Latest"}</SelectItem>
                      <SelectItem value="oldest">{isAr ? "Ø§Ù„Ø£Ù‚Ø¯Ù…" : "Oldest"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label={isAr ? "Ø§Ù„Ø¹Ù†Ø§ØµØ± ÙÙŠ Ø§Ù„ØµÙØ­Ø©" : "Items per page"} value={String(settings.previousEvents?.itemsPerPage || 24)} onChange={(value) => updatePrevious({ itemsPerPage: Number(value) })} />
              </div>
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm mt-4">
                <h4 className="font-extrabold text-[#17172f]">{isAr ? "Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙŠ" : "Informational Section"}</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <ToggleCard label={isAr ? "ØªÙ…ÙƒÙŠÙ† Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙŠ" : "Enable informational section"} checked={!!settings.previousEvents?.informationSection?.enabled} onChange={(v) => updatePreviousInfo({ enabled: v })} />
                  <Field label={isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Badge / Eyebrow (English)"} value={settings.previousEvents?.informationSection?.badgeEn || ''} onChange={(v) => updatePreviousInfo({ badgeEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„Ø¹Ø¨Ø§Ø±Ø© Ø§Ù„ØªÙ…Ù‡ÙŠØ¯ÙŠØ© (Ø¹Ø±Ø¨ÙŠ)" : "Badge / Eyebrow (Arabic)"}</Label>
                    <Input value={settings.previousEvents?.informationSection?.badgeAr || ''} onChange={(e) => updatePreviousInfo({ badgeAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <Field label={isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Heading (English)"} value={settings.previousEvents?.informationSection?.titleEn || ''} onChange={(v) => updatePreviousInfo({ titleEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„Ø¹Ù†ÙˆØ§Ù† (Ø¹Ø±Ø¨ÙŠ)" : "Heading (Arabic)"}</Label>
                    <Input value={settings.previousEvents?.informationSection?.titleAr || ''} onChange={(e) => updatePreviousInfo({ titleAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <TextAreaField label={isAr ? "Ø§Ù„ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Description (English)"} value={settings.previousEvents?.informationSection?.descriptionEn || ''} onChange={(v) => updatePreviousInfo({ descriptionEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Ø§Ù„ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)" : "Description (Arabic)"}</Label>
                    <Textarea value={settings.previousEvents?.informationSection?.descriptionAr || ''} onChange={(e) => updatePreviousInfo({ descriptionAr: e.target.value })} dir="rtl" className="rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <ImageUrlDropzone label={isAr ? "ØµÙˆØ±Ø© Ø§Ù„Ù‚Ø³Ù…" : "Section image"} value={settings.previousEvents?.informationSection?.imageUrl || ''} onChange={(v) => updatePreviousInfo({ imageUrl: v })} />
                  <Field label={isAr ? "Alt Ù†Øµ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Image alt (English)"} value={settings.previousEvents?.informationSection?.imageAltEn || ''} onChange={(v) => updatePreviousInfo({ imageAltEn: v })} />
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500">{isAr ? "Alt Ù†Øµ (Ø¹Ø±Ø¨ÙŠ)" : "Image alt (Arabic)"}</Label>
                    <Input value={settings.previousEvents?.informationSection?.imageAltAr || ''} onChange={(e) => updatePreviousInfo({ imageAltAr: e.target.value })} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "Ù…ÙˆØ¶Ø¹ Ø§Ù„ØµÙˆØ±Ø©" : "Image position"}</Label>
                    <Select value={settings.previousEvents?.informationSection?.imagePosition || 'right'} onValueChange={(value) => updatePreviousInfo({ imagePosition: value as any })}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">{isAr ? "ÙŠØ³Ø§Ø±" : "Left"}</SelectItem>
                        <SelectItem value="right">{isAr ? "ÙŠÙ…ÙŠÙ†" : "Right"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-extrabold">{isAr ? "Ø§Ù„Ù†Ù‚Ø§Ø·" : "Bullet items"}</h5>
                  <div className="space-y-3 mt-3">
                    {(settings.previousEvents?.informationSection?.bullets || []).map((b, i) => (
                      <div key={b.id} className="grid gap-2 md:grid-cols-[1fr_auto] items-start">
                        <div className="grid gap-2">
                          <Field label={isAr ? `Ø§Ù„Ù†Ù‚Ø·Ø© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ) #${i+1}` : `Bullet (English) #${i+1}`} value={b.textEn} onChange={(v) => setSettings(s => ({ ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: (s.previousEvents?.informationSection?.bullets||[]).map(x => x.id === b.id ? { ...x, textEn: v } : x) } } } as SiteContentSettings))} />
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500">{isAr ? `Ø§Ù„Ù†Ù‚Ø·Ø© (Ø¹Ø±Ø¨ÙŠ) #${i+1}` : `Bullet (Arabic) #${i+1}`}</Label>
                            <Input value={b.textAr} onChange={(e) => setSettings(s => ({ ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: (s.previousEvents?.informationSection?.bullets||[]).map(x => x.id === b.id ? { ...x, textAr: e.target.value } : x) } } } as SiteContentSettings))} dir="rtl" className="h-11 rounded-xl bg-slate-50/50 text-right" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} onClick={() => setSettings(s => {
                              const arr = (s.previousEvents?.informationSection?.bullets || []).slice();
                              const idx = arr.findIndex(x => x.id === b.id);
                              if (idx <= 0) return s;
                              const [it] = arr.splice(idx,1);
                              arr.splice(idx-1,0,it);
                              return { ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: arr } } } as SiteContentSettings;
                            })} icon={ArrowUp} />
                            <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} onClick={() => setSettings(s => {
                              const arr = (s.previousEvents?.informationSection?.bullets || []).slice();
                              const idx = arr.findIndex(x => x.id === b.id);
                              if (idx < 0 || idx === arr.length-1) return s;
                              const [it] = arr.splice(idx,1);
                              arr.splice(idx+1,0,it);
                              return { ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: arr } } } as SiteContentSettings;
                            })} icon={ArrowDown} />
                          </div>
                          <IconButton label={adminT(language, "common.delete")} onClick={() => setSettings(s => ({ ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: (s.previousEvents?.informationSection?.bullets||[]).filter(x => x.id !== b.id) } } } as SiteContentSettings))} icon={Trash2} tone="danger" />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => setSettings(s => ({ ...s, previousEvents: { ...(s.previousEvents||{}), informationSection: { ...(s.previousEvents?.informationSection||{}), bullets: [...(s.previousEvents?.informationSection?.bullets||[]), { id: `p-${Date.now()}`, textEn: 'New bullet', textAr: 'Ù†Ù‚Ø·Ø© Ø¬Ø¯ÙŠØ¯Ø©' }] } } } as SiteContentSettings))} className="h-11 rounded-2xl font-extrabold w-full">
                      <Plus className="h-4 w-4" />
                      {isAr ? 'Ø¥Ø¶Ø§ÙØ© Ù†Ù‚Ø·Ø©' : 'Add bullet'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
<TabsContent value="legal" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <Tabs value={legalSectionTab} onValueChange={(value) => setLegalSectionTab(value as LegalSectionTab)} className="space-y-4">
                <TabsList className="inline-flex h-auto w-fit rounded-2xl bg-white p-1 shadow-sm">
                  <TabsTrigger value="terms" className="rounded-xl px-4 py-2 text-xs font-extrabold">{isAr ? "الشروط والأحكام" : "Terms & Conditions"}</TabsTrigger>
                  <TabsTrigger value="privacy" className="rounded-xl px-4 py-2 text-xs font-extrabold">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</TabsTrigger>
                </TabsList>

                <div className="rounded-[22px] border border-amber-100 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-900">
                  {isAr ? "هذا المحتوى يظهر في الصفحات العامة القانونية. استخدم بيانات حقيقية خاصة بالمنصة، وتجنب إضافة وعود قانونية أو أمنية غير مؤكدة." : "This content is published on the public legal pages. Use platform-specific wording and avoid legal or security promises that are not confirmed."}
                </div>

                <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                  <div className="space-y-5">
                    <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                      <ToggleCard label={isAr ? "إظهار الصفحة" : "Enable page"} checked={selectedLegalPage.enabled !== false} onChange={(value) => updateLegalPage(legalSectionTab, { enabled: value })} />
                      <Field label={isAr ? "تاريخ آخر تحديث" : "Last updated date"} value={selectedLegalPage.lastUpdated} onChange={(value) => updateLegalPage(legalSectionTab, { lastUpdated: value })} />
                      <Field label="Hero title EN" value={selectedLegalPage.hero.titleEn} onChange={(value) => updateLegalHero(legalSectionTab, { titleEn: value })} />
                      <Field label="Hero title AR" value={selectedLegalPage.hero.titleAr} onChange={(value) => updateLegalHero(legalSectionTab, { titleAr: value })} dir="rtl" />
                      <TextAreaField label="Hero description EN" value={selectedLegalPage.hero.descriptionEn} onChange={(value) => updateLegalHero(legalSectionTab, { descriptionEn: value })} />
                      <TextAreaField label="Hero description AR" value={selectedLegalPage.hero.descriptionAr} onChange={(value) => updateLegalHero(legalSectionTab, { descriptionAr: value })} dir="rtl" />
                      <ImageUrlDropzone label={isAr ? "صورة الهيرو" : "Hero image"} value={selectedLegalPage.hero.imageUrl} onChange={(value) => updateLegalHero(legalSectionTab, { imageUrl: value })} helperText={isAr ? "ارفع صورة أو ضع رابط صورة مناسبة للصفحة القانونية." : "Upload or paste an image URL for this legal page."} />
                      <div className="space-y-2">
                        <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">{isAr ? "موضع الصورة" : "Image focal position"}</Label>
                        <Select value={selectedLegalPage.hero.focalPosition} onValueChange={(value: any) => updateLegalHero(legalSectionTab, { focalPosition: value })}>
                          <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-extrabold"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["center", "top", "bottom", "left", "right"].map((position) => <SelectItem key={position} value={position}>{position}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Field label="Image alt EN" value={selectedLegalPage.hero.imageAltEn} onChange={(value) => updateLegalHero(legalSectionTab, { imageAltEn: value })} />
                      <Field label="Image alt AR" value={selectedLegalPage.hero.imageAltAr} onChange={(value) => updateLegalHero(legalSectionTab, { imageAltAr: value })} dir="rtl" />
                    </div>

                    <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                      <h3 className="md:col-span-2 text-lg font-black text-[#17172f]">{isAr ? "بيانات التواصل و SEO" : "Contact & SEO"}</h3>
                      <Field label="Email" value={selectedLegalPage.contact.email} onChange={(value) => updateLegalContact(legalSectionTab, { email: value })} />
                      <Field label="Phone" value={selectedLegalPage.contact.phone} onChange={(value) => updateLegalContact(legalSectionTab, { phone: value })} />
                      <Field label="Address EN" value={selectedLegalPage.contact.addressEn} onChange={(value) => updateLegalContact(legalSectionTab, { addressEn: value })} />
                      <Field label="Address AR" value={selectedLegalPage.contact.addressAr} onChange={(value) => updateLegalContact(legalSectionTab, { addressAr: value })} dir="rtl" />
                      <Field label="SEO title EN" value={selectedLegalPage.seo.titleEn} onChange={(value) => updateLegalSeo(legalSectionTab, { titleEn: value })} />
                      <Field label="SEO title AR" value={selectedLegalPage.seo.titleAr} onChange={(value) => updateLegalSeo(legalSectionTab, { titleAr: value })} dir="rtl" />
                      <TextAreaField label="SEO description EN" value={selectedLegalPage.seo.descriptionEn} onChange={(value) => updateLegalSeo(legalSectionTab, { descriptionEn: value })} />
                      <TextAreaField label="SEO description AR" value={selectedLegalPage.seo.descriptionAr} onChange={(value) => updateLegalSeo(legalSectionTab, { descriptionAr: value })} dir="rtl" />
                      <Field label="Canonical path" value={selectedLegalPage.seo.canonicalPath} onChange={(value) => updateLegalSeo(legalSectionTab, { canonicalPath: value })} />
                      <Field label="OG image" value={selectedLegalPage.seo.ogImage} onChange={(value) => updateLegalSeo(legalSectionTab, { ogImage: value })} />
                    </div>

                    <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-[#17172f]">{isAr ? "أقسام الصفحة" : "Page Sections"}</h3>
                          <p className="mt-1 text-sm font-semibold text-slate-500">{isAr ? "يمكنك إضافة حتى 20 قسما مع التحكم في الترتيب والظهور." : "Add up to 20 sections with ordering and visibility controls."}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => updateLegalSections(legalSectionTab, [...selectedLegalPage.sections, { id: `legal-${Date.now()}`, enabled: true, anchor: `section-${selectedLegalPage.sections.length + 1}`, titleEn: "New section", titleAr: "قسم جديد", contentEn: "", contentAr: "" }])}
                          className="h-11 rounded-2xl font-extrabold"
                        >
                          <Plus className="h-4 w-4" />
                          {isAr ? "إضافة قسم" : "Add section"}
                        </Button>
                      </div>

                      {selectedLegalPage.sections.map((section, index) => (
                        <div key={section.id} className="grid gap-3 rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Switch checked={section.enabled !== false} onCheckedChange={(value) => updateLegalSections(legalSectionTab, selectedLegalPage.sections.map((item) => item.id === section.id ? { ...item, enabled: value } : item))} />
                              <span className="text-sm font-black text-slate-700">{isAr ? "ظاهر" : "Enabled"} #{index + 1}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IconButton label={isAr ? "تحريك لأعلى" : "Move up"} disabled={index === 0} icon={ArrowUp} onClick={() => {
                                const next = [...selectedLegalPage.sections]
                                const [item] = next.splice(index, 1)
                                next.splice(index - 1, 0, item)
                                updateLegalSections(legalSectionTab, next)
                              }} />
                              <IconButton label={isAr ? "تحريك لأسفل" : "Move down"} disabled={index === selectedLegalPage.sections.length - 1} icon={ArrowDown} onClick={() => {
                                const next = [...selectedLegalPage.sections]
                                const [item] = next.splice(index, 1)
                                next.splice(index + 1, 0, item)
                                updateLegalSections(legalSectionTab, next)
                              }} />
                              <IconButton label={adminT(language, "common.delete")} icon={Trash2} tone="danger" onClick={() => updateLegalSections(legalSectionTab, selectedLegalPage.sections.filter((item) => item.id !== section.id))} />
                            </div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            <Field label="Anchor" value={section.anchor} onChange={(value) => updateLegalSections(legalSectionTab, selectedLegalPage.sections.map((item) => item.id === section.id ? { ...item, anchor: value } : item))} />
                            <Field label="Title EN" value={section.titleEn} onChange={(value) => updateLegalSections(legalSectionTab, selectedLegalPage.sections.map((item) => item.id === section.id ? { ...item, titleEn: value } : item))} />
                            <Field label="Title AR" value={section.titleAr} onChange={(value) => updateLegalSections(legalSectionTab, selectedLegalPage.sections.map((item) => item.id === section.id ? { ...item, titleAr: value } : item))} dir="rtl" />
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <TextAreaField label="Content EN" value={section.contentEn} onChange={(value) => updateLegalSections(legalSectionTab, selectedLegalPage.sections.map((item) => item.id === section.id ? { ...item, contentEn: value } : item))} />
                            <TextAreaField label="Content AR" value={section.contentAr} onChange={(value) => updateLegalSections(legalSectionTab, selectedLegalPage.sections.map((item) => item.id === section.id ? { ...item, contentAr: value } : item))} dir="rtl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-white p-4 shadow-sm">
                    <div className="overflow-hidden rounded-[22px] bg-slate-950 text-white shadow-sm">
                      <div className="relative h-40">
                        <img src={apiAssetUrl(selectedLegalPage.hero.imageUrl)} alt="" className="h-full w-full object-cover opacity-70" />
                        <div className="absolute inset-0 bg-slate-950/45" />
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{legalSectionTab}</p>
                        <h3 className="mt-3 text-2xl font-black">{selectedLegalPage.hero.titleEn}</h3>
                        <p className="mt-3 text-sm font-medium leading-6 text-white/70">{selectedLegalPage.hero.descriptionEn}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs>
            </div>
          </TabsContent>
<TabsContent value="footer" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4">
              <h3 className="text-lg font-bold">{isAr ? "Ù†ØµÙˆØµ Ø§Ù„ÙÙˆØªØ± Ø§Ù„Ø³ÙÙ„ÙŠØ© (Logo & Columns)" : "Footer Bottom Texts (Logo & Columns)"}</h3>
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm md:grid-cols-2">
                <TextAreaField label={isAr ? "ÙˆØµÙ Ø£Ø³ÙÙ„ Ø§Ù„Ù„ÙˆØ¬Ùˆ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Logo Description (English)"} value={settings.homepage.footerLogoDescEn} onChange={(value) => updateHomepage("footerLogoDescEn", value)} />
                <TextAreaField label={isAr ? "ÙˆØµÙ Ø£Ø³ÙÙ„ Ø§Ù„Ù„ÙˆØ¬Ùˆ (Ø¹Ø±Ø¨ÙŠ)" : "Logo Description (Arabic)"} value={settings.homepage.footerLogoDescAr} onChange={(value) => updateHomepage("footerLogoDescAr", value)} />

                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø¹Ù…ÙˆØ¯ Ø§Ù„Ø®Ø¯Ù…Ø§Øª (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Services Column Title (English)"} value={settings.homepage.footerServicesTitleEn} onChange={(value) => updateHomepage("footerServicesTitleEn", value)} />
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø¹Ù…ÙˆØ¯ Ø§Ù„Ø®Ø¯Ù…Ø§Øª (Ø¹Ø±Ø¨ÙŠ)" : "Services Column Title (Arabic)"} value={settings.homepage.footerServicesTitleAr} onChange={(value) => updateHomepage("footerServicesTitleAr", value)} />

                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø¹Ù…ÙˆØ¯ Ø§Ù„Ø¯Ø¹Ù… (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Support Column Title (English)"} value={settings.homepage.footerSupportTitleEn} onChange={(value) => updateHomepage("footerSupportTitleEn", value)} />
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø¹Ù…ÙˆØ¯ Ø§Ù„Ø¯Ø¹Ù… (Ø¹Ø±Ø¨ÙŠ)" : "Support Column Title (Arabic)"} value={settings.homepage.footerSupportTitleAr} onChange={(value) => updateHomepage("footerSupportTitleAr", value)} />

                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø¹Ù…ÙˆØ¯ Ø§Ù„Ø´Ø±ÙƒØ© (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Company Column Title (English)"} value={settings.homepage.footerCompanyTitleEn} onChange={(value) => updateHomepage("footerCompanyTitleEn", value)} />
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø¹Ù…ÙˆØ¯ Ø§Ù„Ø´Ø±ÙƒØ© (Ø¹Ø±Ø¨ÙŠ)" : "Company Column Title (Arabic)"} value={settings.homepage.footerCompanyTitleAr} onChange={(value) => updateHomepage("footerCompanyTitleAr", value)} />
                
                <Field label={isAr ? "Ù†Øµ Ø§Ù„Ø­Ù‚ÙˆÙ‚ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Copyright Text (English)"} value={settings.homepage.footerCopyrightEn} onChange={(value) => updateHomepage("footerCopyrightEn", value)} />
                <Field label={isAr ? "Ù†Øµ Ø§Ù„Ø­Ù‚ÙˆÙ‚ (Ø¹Ø±Ø¨ÙŠ)" : "Copyright Text (Arabic)"} value={settings.homepage.footerCopyrightAr} onChange={(value) => updateHomepage("footerCopyrightAr", value)} />
              </div>
            </div>

            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 mt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{isAr ? "Ø±ÙˆØ§Ø¨Ø· Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠ" : "Social Media Links"}</h3>
                <Button onClick={() => setSettings({ ...settings, socialLinks: [...(settings.socialLinks || []), { id: Date.now().toString(), platform: "twitter", url: "#" }] })} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> {isAr ? "Ø¥Ø¶Ø§ÙØ© Ø±Ø§Ø¨Ø·" : "Add Link"}
                </Button>
              </div>
              <div className="space-y-3">
                {settings.socialLinks?.map((link, index) => (
                  <div key={link.id} className="grid gap-3 rounded-[16px] bg-white p-4 shadow-sm md:grid-cols-[1.5fr_2fr_auto] items-center">
                    <Select value={link.platform} onValueChange={(val: any) => {
                      const newLinks = [...settings.socialLinks]
                      newLinks[index].platform = val
                      setSettings({ ...settings, socialLinks: newLinks })
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">X / Twitter</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="URL (e.g. https://...)" value={link.url} onChange={(e) => {
                      const newLinks = [...settings.socialLinks]
                      newLinks[index].url = e.target.value
                      setSettings({ ...settings, socialLinks: newLinks })
                    }} />
                    <Button variant="ghost" size="icon" className="text-rose-500 shrink-0 h-10 w-10" onClick={() => {
                      const newLinks = settings.socialLinks.filter((_, i) => i !== index)
                      setSettings({ ...settings, socialLinks: newLinks })
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 mt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{isAr ? "Ø±ÙˆØ§Ø¨Ø· Ø§Ù„ÙÙˆØªØ±" : "Footer Links"}</h3>
                <Button onClick={() => setSettings({ ...settings, footerLinks: [...(settings.footerLinks || []), { id: Date.now().toString(), col: "services", labelEn: "New Link", labelAr: "Ø±Ø§Ø¨Ø· Ø¬Ø¯ÙŠØ¯", href: "#" }] })} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> {isAr ? "Ø¥Ø¶Ø§ÙØ© Ø±Ø§Ø¨Ø·" : "Add Link"}
                </Button>
              </div>
              <div className="space-y-3">
                {settings.footerLinks?.map((link, index) => (
                  <div key={link.id} className="grid gap-3 rounded-[16px] bg-white p-4 shadow-sm md:grid-cols-[1fr_1.5fr_1.5fr_1fr_auto] items-center">
                    <Select value={link.col} onValueChange={(val: any) => {
                      const newLinks = [...settings.footerLinks]
                      newLinks[index].col = val
                      setSettings({ ...settings, footerLinks: newLinks })
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="services">{isAr ? "Ø§Ù„Ø®Ø¯Ù…Ø§Øª" : "Services"}</SelectItem>
                        <SelectItem value="support">{isAr ? "Ø§Ù„Ø¯Ø¹Ù…" : "Support"}</SelectItem>
                        <SelectItem value="company">{isAr ? "Ø§Ù„Ø´Ø±ÙƒØ©" : "Company"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder={isAr ? "Ø§Ù„Ø§Ø³Ù… (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)" : "Label (English)"} value={link.labelEn} onChange={(e) => {
                      const newLinks = [...settings.footerLinks]
                      newLinks[index].labelEn = e.target.value
                      setSettings({ ...settings, footerLinks: newLinks })
                    }} />
                    <Input placeholder={isAr ? "Ø§Ù„Ø§Ø³Ù… (Ø¹Ø±Ø¨ÙŠ)" : "Label (Arabic)"} value={link.labelAr} onChange={(e) => {
                      const newLinks = [...settings.footerLinks]
                      newLinks[index].labelAr = e.target.value
                      setSettings({ ...settings, footerLinks: newLinks })
                    }} />
                    <Input placeholder="URL" value={link.href} onChange={(e) => {
                      const newLinks = [...settings.footerLinks]
                      newLinks[index].href = e.target.value
                      setSettings({ ...settings, footerLinks: newLinks })
                    }} />
                    <Button variant="ghost" size="icon" className="text-rose-500 shrink-0 h-10 w-10" onClick={() => {
                      const newLinks = settings.footerLinks.filter((_, i) => i !== index)
                      setSettings({ ...settings, footerLinks: newLinks })
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
<TabsContent value="menu" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_380px]">
              <div className="space-y-3 rounded-[22px] bg-white p-4 shadow-sm">
                {settings.menu.map((item, index) => (
                  <div key={item.id} className="grid gap-3 rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_auto]">
                    <Field label={isAr ? "Ø§Ø³Ù… Ø§Ù„Ø±Ø§Ø¨Ø· Ø¨Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©" : "English label"} value={item.labelEn} onChange={(value) => updateMenuItem(item.id, "labelEn", value)} />
                    <Field label={isAr ? "Ø§Ø³Ù… Ø§Ù„Ø±Ø§Ø¨Ø· Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©" : "Arabic label"} value={item.labelAr} onChange={(value) => updateMenuItem(item.id, "labelAr", value)} />
                    <Field label={isAr ? "Ø§Ù„Ø±Ø§Ø¨Ø· / Ø§Ù„Ù‚Ø³Ù…" : "URL / Anchor"} value={item.href} onChange={(value) => updateMenuItem(item.id, "href", value)} />
                    <div className="flex items-end gap-2">
                      <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø¹Ù„Ù‰" : "Move up"} disabled={index === 0} onClick={() => moveMenuItem(item.id, -1)} icon={ArrowUp} />
                      <IconButton label={isAr ? "ØªØ­Ø±ÙŠÙƒ Ù„Ø£Ø³ÙÙ„" : "Move down"} disabled={index === settings.menu.length - 1} onClick={() => moveMenuItem(item.id, 1)} icon={ArrowDown} />
                      <div className="flex h-11 items-center gap-2 rounded-2xl bg-[#f8f5fb] px-3">
                        <Switch checked={item.visible} onCheckedChange={(value) => updateMenuItem(item.id, "visible", value)} />
                        <span className="text-xs font-extrabold text-slate-500">{adminT(language, "settings.show")}</span>
                      </div>
                      <IconButton label={adminT(language, "common.delete")} onClick={() => deleteMenuItem(item.id)} icon={Trash2} tone="danger" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addMenuItem} className="h-11 rounded-2xl font-extrabold">
                  <Plus className="h-4 w-4" />
                  {isAr ? "Ø¥Ø¶Ø§ÙØ© Ø±Ø§Ø¨Ø· Ù„Ù„Ù‚Ø§Ø¦Ù…Ø©" : "Add menu item"}
                </Button>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="rounded-[22px] bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#17172f]">
                    <Menu className="h-4 w-4 text-[hsl(var(--primary))]" />
                    {isAr ? "Ù…Ø¹Ø§ÙŠÙ†Ø© Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…ÙˆÙ‚Ø¹" : "Public navigation preview"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {visibleMenu.map((item) => (
                      <span key={item.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-600">
                        {item.labelEn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
<TabsContent value="seo" className="mt-0">
            <div className="grid gap-5 rounded-[24px] bg-slate-50 p-4 xl:grid-cols-[1fr_420px]">
              <div className="grid gap-4 rounded-[22px] bg-white p-4 shadow-sm">
                <Field label={isAr ? "Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…ÙŠØªØ§" : "Meta title"} value={settings.seo.metaTitle} onChange={(value) => updateSeo("metaTitle", value)} />
                <TextAreaField label={isAr ? "ÙˆØµÙ Ø§Ù„Ù…ÙŠØªØ§" : "Meta description"} value={settings.seo.metaDescription} onChange={(value) => updateSeo("metaDescription", value)} />
                <Field label={isAr ? "Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Canonical" : "Canonical URL"} value={settings.seo.canonicalUrl} onChange={(value) => updateSeo("canonicalUrl", value)} />
                <Field label={isAr ? "Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…ÙØªØ§Ø­ÙŠØ©" : "Keywords"} value={settings.seo.keywords} onChange={(value) => updateSeo("keywords", value)} />
                <ImageUrlDropzone label={isAr ? "ØµÙˆØ±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ© Open Graph" : "Open Graph image"} value={settings.seo.ogImage} onChange={(value) => updateSeo("ogImage", value)} />
                <div className="flex flex-wrap gap-3">
                  <ToggleCard label={isAr ? "Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„Ø£Ø±Ø´ÙØ©" : "Allow indexing"} checked={settings.seo.robotsIndex} onChange={(value) => updateSeo("robotsIndex", value)} />
                  <ToggleCard label={isAr ? "ØªØªØ¨Ø¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø·" : "Follow links"} checked={settings.seo.robotsFollow} onChange={(value) => updateSeo("robotsFollow", value)} />
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 shadow-sm">
                <div className="rounded-[22px] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#17172f]">
                    <Search className="h-4 w-4 text-[hsl(var(--primary))]" />
                    {isAr ? "Ù…Ø¹Ø§ÙŠÙ†Ø© Ù†ØªÙŠØ¬Ø© Ø§Ù„Ø¨Ø­Ø«" : "Search result preview"}
                  </div>
                  <p className="truncate text-xs font-medium text-emerald-700">{settings.seo.canonicalUrl}</p>
                  <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-[#1a0dab]">{settings.seo.metaTitle}</h3>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{settings.seo.metaDescription}</p>
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-extrabold text-slate-400">{adminT(language, "settings.robots")}</p>
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {settings.seo.robotsIndex ? "index" : "noindex"}, {settings.seo.robotsFollow ? "follow" : "nofollow"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function AboutPreviewCard({ settings, section, isAr }: { settings: AboutPageSettings; section: AboutSectionTab; isAr: boolean }) {
  const title =
    section === "hero"
      ? (isAr ? settings.hero.titleAr : settings.hero.titleEn)
      : section === "overview"
        ? (isAr ? settings.overview.headingAr : settings.overview.headingEn)
      : section === "ecosystem"
        ? (isAr ? settings.ecosystem.headingAr : settings.ecosystem.headingEn)
        : section === "team"
          ? (isAr ? settings.team.headingAr : settings.team.headingEn)
          : (isAr ? settings.vision.headingAr : settings.vision.headingEn)
  const eyebrow =
    section === "hero"
      ? (isAr ? settings.hero.eyebrowAr : settings.hero.eyebrowEn)
      : section === "overview"
        ? (isAr ? settings.overview.eyebrowAr : settings.overview.eyebrowEn)
      : section === "ecosystem"
        ? (isAr ? settings.ecosystem.eyebrowAr : settings.ecosystem.eyebrowEn)
        : section === "team"
          ? (isAr ? settings.team.eyebrowAr : settings.team.eyebrowEn)
          : (isAr ? settings.vision.eyebrowAr : settings.vision.eyebrowEn)
  const image =
    section === "hero"
      ? settings.hero.imageUrl
      : section === "overview"
        ? settings.overview.images[0]?.imageUrl
      : section === "vision"
        ? settings.vision.imageUrl
        : section === "team"
          ? settings.team.members.find((member) => member.imageUrl)?.imageUrl || ""
        : ""

  return (
    <div className="rounded-[24px] bg-white p-4 shadow-sm">
      <div className="overflow-hidden rounded-[22px] bg-slate-950 text-white shadow-sm">
        <div className="relative min-h-[260px] p-5">
          {image ? <img src={apiAssetUrl(image)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
          <div className="relative flex min-h-[220px] flex-col justify-end">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">{eyebrow}</p>
            <h3 className="mt-4 text-3xl font-black leading-tight">{title}</h3>
          </div>
        </div>
        <div className="grid gap-2 bg-white p-4 text-slate-900">
          {section === "ecosystem" ? (
            settings.ecosystem.cards.filter((card) => card.enabled).slice(0, 4).map((card) => (
              <div key={card.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-black text-[hsl(var(--primary))]">{isAr ? card.titleAr : card.titleEn}</p>
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">{isAr ? card.descriptionAr : card.descriptionEn}</p>
              </div>
            ))
          ) : section === "team" ? (
            settings.team.members.filter((member) => member.enabled && (member.nameEn || member.nameAr)).slice(0, 4).map((member) => (
              <div key={member.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-black text-[hsl(var(--primary))]">{isAr ? member.nameAr : member.nameEn}</p>
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500">{isAr ? member.jobTitleAr : member.jobTitleEn}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-[hsl(var(--primary))] p-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/70">About Page</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/80">{isAr ? "Ù…Ø¹Ø§ÙŠÙ†Ø© Ø³Ø±ÙŠØ¹Ø© Ù„Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø­Ø§Ù„ÙŠ." : "Quick preview of the current content."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, className, dir }: { label: string; value: string; onChange: (value: string) => void; className?: string; dir?: "ltr" | "rtl" }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} dir={dir} className={cn("h-11 rounded-2xl border-slate-200 bg-white font-semibold shadow-sm", dir === "rtl" && "text-right")} />
    </div>
  )
}

function TextAreaField({ label, value, onChange, dir }: { label: string; value: string; onChange: (value: string) => void; dir?: "ltr" | "rtl" }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} dir={dir} className={cn("min-h-[112px] rounded-2xl border-slate-200 bg-white font-semibold leading-6 shadow-sm", dir === "rtl" && "text-right")} />
    </div>
  )
}

function IconButton({ label, icon: Icon, onClick, disabled, tone = "default" }: { label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean; tone?: "default" | "danger" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-xl bg-[#f8f5fb] text-slate-500 transition hover:bg-white hover:text-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-40",
        tone === "danger" && "text-red-500 hover:text-red-600"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function ToggleCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex h-12 min-w-[180px] cursor-pointer items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

