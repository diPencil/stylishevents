"use client"

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedCtaButton } from "@/components/ui/animated-cta-button"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { defaultPlatformTheme, normalizePlatformTheme, readSavedPlatformTheme, resolvePlatformTheme } from "@/lib/platform-theme"
import { publicNavLinks } from "@/lib/public-pages-content"

type PublicMenuLink = {
  href: string
  labelEn: string
  labelAr: string
  visible?: boolean
}

const siteMenuStorageKey = "stylish-events-site-content-settings"
const pageHrefs = ["/upcoming-events", "/previous-events", "/about", "/contact"]
const arabicNavLabels: Record<string, string> = {
  "/": "الرئيسية",
  "/upcoming-events": "الفعاليات القادمة",
  "/previous-events": "فعاليات سابقة",
  "/about": "عن الشركة",
  "/contact": "تواصل معنا",
}

function hasCorruptedText(value: unknown): boolean {
  return typeof value === "string" && /(Ãƒ|Ã‚|Ã˜|Ã™|Ã¢â‚¬|Ã¯Â¿Â½|ï¿½|�|\?{4,})/.test(value)
}

function hasCorruptedTree(value: unknown): boolean {
  if (hasCorruptedText(value)) return true
  if (Array.isArray(value)) return value.some(hasCorruptedTree)
  if (value && typeof value === "object") return Object.values(value).some(hasCorruptedTree)
  return false
}

function cleanLogoUrl(value: string, fallback: string) {
  return /^blob:/i.test(value) ? fallback : value
}

function brandAssetsFromTheme(theme: any) {
  const normalized = normalizePlatformTheme(theme)
  return {
    logoEnUrl: cleanLogoUrl(normalized.logoEnUrl, "/logo.png"),
    logoArUrl: cleanLogoUrl(normalized.logoArUrl, "/LogoAR.png"),
  }
}

function roleFromToken(token: string) {
  try {
    const encoded = token.split(".")[0]
    if (!encoded) return ""
    const payload = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")))
    return payload?.role || ""
  } catch {
    return ""
  }
}

function readAuthCta() {
  if (typeof window === "undefined") return { href: "/login", isLoggedIn: false }

  const token =
    window.localStorage.getItem("stylish-events-admin-token") ||
    window.localStorage.getItem("stylish-events-auth-token") ||
    window.localStorage.getItem("stylish-events-token")
  if (!token) return { href: "/login", isLoggedIn: false }

  try {
    const savedUser = window.localStorage.getItem("stylish-events-admin-user")
    const user = savedUser ? JSON.parse(savedUser) : null
    const role = user?.role_code || user?.role?.code || user?.role || roleFromToken(token)
    const href = ["admin", "organizer", "employee", "back_office"].includes(role) ? "/admin" : "/dashboard"
    return { href, isLoggedIn: true }
  } catch {
    const role = roleFromToken(token)
    return { href: ["admin", "organizer", "employee", "back_office"].includes(role) ? "/admin" : "/dashboard", isLoggedIn: true }
  }
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [menuLinks, setMenuLinks] = useState<PublicMenuLink[]>(() => publicNavLinks.filter((link) => link.href !== "/why-us"))
  const [brandAssets, setBrandAssets] = useState(() => brandAssetsFromTheme(defaultPlatformTheme))
  const [authCta, setAuthCta] = useState({ href: "/login", isLoggedIn: false })
  const pathname = usePathname()
  const { language, setLanguage, t, isRtl } = useLanguage()

  useEffect(() => {
    setAuthCta(readAuthCta())
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const syncAuthCta = () => setAuthCta(readAuthCta())
    window.addEventListener("storage", syncAuthCta)
    window.addEventListener("focus", syncAuthCta)
    return () => {
      window.removeEventListener("storage", syncAuthCta)
      window.removeEventListener("focus", syncAuthCta)
    }
  }, [])

  useEffect(() => {
    const applyBrandAssets = (theme: any) => {
      setBrandAssets(brandAssetsFromTheme(theme))
    }

    const savedTheme = readSavedPlatformTheme()
    applyBrandAssets(savedTheme)

    platformApi.getThemeSettings()
      .then((theme) => {
        if (!theme) return
        applyBrandAssets(resolvePlatformTheme(theme, savedTheme))
      })
      .catch(() => {})

    const syncTheme = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : null
      if (detail) applyBrandAssets(detail)
    }
    window.addEventListener("stylish-events-theme-settings-updated", syncTheme)
    return () => window.removeEventListener("stylish-events-theme-settings-updated", syncTheme)
  }, [])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(siteMenuStorageKey)
      if (!saved) return

      const parsed = JSON.parse(saved) as { menu?: PublicMenuLink[] }
      if (hasCorruptedTree(parsed)) {
        window.localStorage.removeItem(siteMenuStorageKey)
        setMenuLinks(publicNavLinks.filter((link) => link.href !== "/why-us"))
        return
      }
      const savedMenu = parsed.menu?.filter((item) => item.visible !== false)
      if (!savedMenu?.length) return

      const hasNewPageLinks = savedMenu.some((item) => pageHrefs.includes(item.href))
      setMenuLinks((hasNewPageLinks ? savedMenu : publicNavLinks).filter((link) => link.href !== "/why-us"))
    } catch {
      setMenuLinks(publicNavLinks.filter((link) => link.href !== "/why-us"))
    }
  }, [])

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar")
  }

  const isActive = (href: string) => {
    const currentPath = pathname || "/"
    if (href === "/") return currentPath === "/"
    return currentPath === href || currentPath.startsWith(`${href}/`)
  }

  const navLabel = (link: PublicMenuLink) => {
    if (!isRtl) return link.labelEn
    if (link.href === "/") return "الرئيسية"
    if (link.href === "/upcoming-events") return "الفعاليات القادمة"
    if (link.href === "/previous-events") return "فعاليات سابقة"
    if (link.href === "/about") return "عن المنصة"
    if (link.href === "/contact") return "تواصل معنا"
    return arabicNavLabels[link.href] || link.labelAr
  }

  return (
    <header className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="flex w-full max-w-[95%] xl:max-w-7xl items-center justify-between rounded-full border border-slate-100 bg-white py-3 px-4 shadow-lg transition-all duration-300 md:px-6"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative overflow-hidden transition-all duration-300 h-10 w-36 md:h-12 md:w-44">
            <img
              src={apiAssetUrl(isRtl ? brandAssets.logoArUrl : brandAssets.logoEnUrl) || (isRtl ? "/LogoAR.png" : "/logo.png")}
              alt="Stylish Events Services"
              className="h-full w-full object-contain"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {menuLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold transition-colors ${
                isActive(link.href) ? "text-primary" : "text-[#475569] hover:text-primary"
              }`}
            >
              {navLabel(link)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="rounded-full text-xs font-extrabold">
            {language === "ar" ? "EN" : "AR"}
          </Button>

          <Link href={authCta.href}>
            <div className="flex items-center">
              <AnimatedCtaButton style={{ '--main-size': '0.8em' } as React.CSSProperties}>
                <span className="hidden md:inline">{authCta.isLoggedIn ? (isRtl ? "لوحة التحكم" : "Dashboard") : (isRtl ? "تسجيل الدخول" : "Log in")}</span>
                <span className="md:hidden">{authCta.isLoggedIn ? (isRtl ? "لوحة" : "Dashboard") : (isRtl ? "دخول" : "Log in")}</span>
              </AnimatedCtaButton>
            </div>
          </Link>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700 lg:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className={`fixed bottom-0 top-0 z-[70] flex w-4/5 max-w-sm flex-col bg-white shadow-2xl lg:hidden ${isRtl ? "left-0" : "right-0"}`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <span className="text-xl font-black text-slate-900">{t("common.brand")}</span>
                <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-slate-50 p-2 text-slate-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <nav className="flex flex-col gap-5">
                  {menuLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-2xl font-black text-slate-800 transition-colors hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {navLabel(link)}
                    </Link>
                  ))}
                </nav>

                <div className="mt-12 space-y-5">
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4"
                  >
                    <span className="text-sm font-extrabold text-slate-600">{isRtl ? "Ø§Ù„Ù„ØºØ©" : "Language"}</span>
                    <span className="text-sm font-extrabold uppercase text-primary">{language === "ar" ? "English" : "Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©"}</span>
                  </button>

                  <Link href={authCta.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="mt-4 flex justify-center">
                        <AnimatedCtaButton style={{ '--main-size': '0.9em' } as React.CSSProperties}>
                          {authCta.isLoggedIn ? (isRtl ? "لوحة التحكم" : "Dashboard") : (isRtl ? "تسجيل الدخول" : "Log in")}
                        </AnimatedCtaButton>
                      </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

