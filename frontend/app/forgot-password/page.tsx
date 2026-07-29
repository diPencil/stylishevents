"use client"

import type React from "react"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthBrandHeadline } from "@/components/auth/auth-brand-headline"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { normalizePlatformTheme, readSavedPlatformTheme, resolvePlatformTheme } from "@/lib/platform-theme"
import type { PlatformThemeSettings } from "@/types/platform"

const copy = {
  en: {
    brandLine: "ACCOUNT RECOVERY",
    description: "Recover access to your event workspace with a secure reset request.",
    future: "SECURE ACCESS",
    headline: "Stylish Events",
    panelTitle: "Forgot password?",
    panelText: "Enter your email or username and we will start the recovery process.",
    loginLabel: "Email or username",
    loginPlaceholder: "Enter your email or username",
    submit: "Send Reset Instructions",
    loading: "Sending...",
    success: "If this account exists, reset instructions will be sent.",
    errorFallback: "Could not request password reset",
    back: "Back to login",
    toggleLanguage: "Toggle language",
    languageButton: "AR",
    secure: "Stylish Events Secure Access",
  },
  ar: {
    brandLine: "استعادة الحساب",
    description: "استعد الوصول إلى مساحة فعالياتك من خلال طلب إعادة تعيين آمن.",
    future: "دخول آمن",
    headline: "Stylish Events",
    panelTitle: "نسيت كلمة المرور؟",
    panelText: "اكتب البريد الإلكتروني أو اسم المستخدم وسنبدأ عملية الاستعادة.",
    loginLabel: "البريد الإلكتروني أو اسم المستخدم",
    loginPlaceholder: "اكتب البريد أو اسم المستخدم",
    submit: "إرسال تعليمات الاستعادة",
    loading: "جاري الإرسال...",
    success: "إذا كان الحساب موجودًا سيتم إرسال تعليمات الاستعادة.",
    errorFallback: "تعذر طلب استعادة كلمة المرور",
    back: "العودة لتسجيل الدخول",
    toggleLanguage: "تغيير اللغة",
    languageButton: "EN",
    secure: "دخول آمن إلى Stylish Events",
  },
}

export default function ForgotPasswordPage() {
  const { language, setLanguage, isRtl } = useLanguage()
  const text = copy[language]
  const [login, setLogin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [theme, setTheme] = useState<PlatformThemeSettings | null>(null)

  useEffect(() => {
    const syncTheme = (event?: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : null
      setTheme(detail ? normalizePlatformTheme(detail) : readSavedPlatformTheme())
    }

    syncTheme()
    platformApi.getThemeSettings().then((settings) => setTheme((current) => resolvePlatformTheme(settings, current || undefined))).catch(() => undefined)
    window.addEventListener("stylish-events-theme-settings-updated", syncTheme)

    return () => window.removeEventListener("stylish-events-theme-settings-updated", syncTheme)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setError("")

    try {
      await platformApi.forgotPassword({ login })
      setMessage(text.success)
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : text.errorFallback)
    } finally {
      setIsLoading(false)
    }
  }

  const logoSrc = apiAssetUrl(isRtl ? theme?.logoArUrl : theme?.logoEnUrl) || (isRtl ? "/LogoAR.png" : "/logo.png")
  const themeStyle = useMemo(
    () =>
      ({
        "--forgot-primary": theme?.primaryColor || "var(--admin-primary, #EA580C)",
        "--forgot-secondary": theme?.secondaryColor || "var(--admin-secondary, #0f172a)",
        "--forgot-accent": theme?.accentColor || "var(--admin-accent, #2563EB)",
      }) as React.CSSProperties,
    [theme],
  )

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-slate-50 text-slate-950 lg:overflow-hidden" dir={isRtl ? "rtl" : "ltr"} style={themeStyle}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 16%, rgba(255,255,255,.94), transparent 24%), radial-gradient(circle at 88% 10%, color-mix(in srgb, var(--forgot-primary) 18%, transparent), transparent 28%), linear-gradient(135deg, #f8fbff 0%, color-mix(in srgb, var(--forgot-primary) 10%, white) 42%, color-mix(in srgb, var(--forgot-accent) 24%, white) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[44%]" style={{ background: "radial-gradient(ellipse at 48% 100%, color-mix(in srgb, var(--forgot-primary) 22%, transparent), transparent 46%)" }} />
      <div
        className="absolute bottom-[9%] left-[-10%] h-52 w-[120%] rotate-[-5deg] rounded-[50%] blur-sm"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,.72), color-mix(in srgb, var(--forgot-primary) 15%, white), color-mix(in srgb, var(--forgot-accent) 24%, white))",
        }}
      />
      <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--forgot-primary) 16%, transparent) 1px, transparent 1.8px)", backgroundSize: "88px 88px" }} />

      <section className="relative z-10 mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-6 px-4 py-5 sm:px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-12 lg:py-8">
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6 md:left-8 lg:left-12">
          <Link href="/" aria-label="Go to homepage" className="block transition hover:opacity-85">
            <img src={logoSrc} alt="Stylish Events" className="h-10 w-auto object-contain sm:h-12" draggable={false} />
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="hidden pt-24 lg:block lg:pt-10">
          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em]" style={{ color: "color-mix(in srgb, var(--forgot-primary) 42%, white)" }}>
              {text.future}
            </p>
            <AuthBrandHeadline isRtl={isRtl} color="var(--forgot-secondary)" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.42em]" style={{ color: "color-mix(in srgb, var(--forgot-primary) 26%, white)" }}>
              {text.brandLine}
            </p>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg">{text.description}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: isRtl ? -24 : 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.08 }} className="flex justify-center pt-16 lg:justify-end lg:pt-0">
          <div className="w-full max-w-[430px] rounded-[12px] border border-white bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-7 lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{text.panelTitle}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{text.panelText}</p>
              </div>
              <button type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")} className="flex h-10 min-w-12 items-center justify-center rounded-[8px] bg-slate-50 px-3 text-sm font-bold text-primary shadow-sm ring-1 ring-slate-200 transition hover:bg-white" aria-label={text.toggleLanguage}>
                {text.languageButton}
              </button>
            </div>

            {error && <div className="mb-4 rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-[8px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-sm font-semibold text-slate-900">
                  {text.loginLabel}
                </Label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
                  <Input
                    id="login"
                    type="text"
                    value={login}
                    placeholder={text.loginPlaceholder}
                    onChange={(event) => setLogin(event.target.value)}
                    required
                    className={`h-12 rounded-[6px] border-0 bg-slate-50/85 text-base font-medium text-slate-700 shadow-none ring-1 ring-slate-200/70 transition focus-visible:ring-2 focus-visible:ring-primary/35 sm:h-14 ${isRtl ? "pr-12 text-right" : "pl-12"}`}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-[6px] bg-gradient-to-r from-primary to-[color:var(--forgot-accent)] text-base font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition hover:opacity-95">
                {isLoading ? text.loading : text.submit}
              </Button>
            </form>

            <Link href="/login" className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-[8px] text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-primary">
              <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
              {text.back}
            </Link>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>{text.secure}</span>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
