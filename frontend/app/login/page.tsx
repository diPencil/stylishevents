"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthBrandHeadline } from "@/components/auth/auth-brand-headline"
import { useLanguage } from "@/contexts/language-context"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { normalizePlatformTheme, readSavedPlatformTheme, resolvePlatformTheme } from "@/lib/platform-theme"
import type { PlatformThemeSettings } from "@/types/platform"

const copy = {
  en: {
    brandLine: "EVENTS MANAGEMENT",
    description: "A secure workspace for tickets, bookings, QR check-in, certificates, and event operations.",
    future: "THE EVENT FUTURE",
    headline: "Stylish Events",
    panelTitle: "Log in to Stylish Events",
    emailTab: "Email login",
    loginLabel: "Email or username",
    loginPlaceholder: "Enter your email or username",
    passwordLabel: "Password",
    forgot: "Forgot password?",
    remember: "I agree to keep this session secure",
    submit: "Log In",
    loading: "Logging in...",
    registerText: "Need to register for an event?",
    register: "Register",
    errorFallback: "Login failed",
    toggleLanguage: "Toggle language",
    hidePassword: "Hide password",
    showPassword: "Show password",
    languageButton: "AR",
    secureAccess: "Stylish Events Secure Access",
  },
  ar: {
    brandLine: "إدارة الفعاليات",
    description: "مساحة آمنة لإدارة التذاكر، الحجوزات، تسجيل الحضور بالـ QR، الشهادات، وتشغيل الفعاليات.",
    future: "مستقبل الفعاليات",
    headline: "Stylish Events",
    panelTitle: "تسجيل الدخول إلى Stylish Events",
    emailTab: "الدخول بالبريد",
    loginLabel: "البريد الإلكتروني أو اسم المستخدم",
    loginPlaceholder: "اكتب البريد أو اسم المستخدم",
    passwordLabel: "كلمة المرور",
    forgot: "نسيت كلمة المرور؟",
    remember: "أوافق على الحفاظ على أمان هذه الجلسة",
    submit: "تسجيل الدخول",
    loading: "جاري الدخول...",
    registerText: "تحتاج للتسجيل في فعالية؟",
    register: "سجل الآن",
    errorFallback: "فشل تسجيل الدخول",
    toggleLanguage: "تغيير اللغة",
    hidePassword: "إخفاء كلمة المرور",
    showPassword: "إظهار كلمة المرور",
    languageButton: "EN",
    secureAccess: "دخول آمن إلى Stylish Events",
  },
}

function authToken() {
  if (typeof window === "undefined") return null

  return (
    window.localStorage.getItem("stylish-events-admin-token") ||
    window.localStorage.getItem("stylish-events-auth-token") ||
    window.localStorage.getItem("stylish-events-token")
  )
}

export default function Login() {
  const router = useRouter()
  const { language, setLanguage, isRtl } = useLanguage()
  const text = copy[language]
  const [showPassword, setShowPassword] = useState(false)
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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

  useEffect(() => {
    const token = authToken()
    if (!token) return

    platformApi
      .me(token)
      .then((user) => {
        window.localStorage.setItem("stylish-events-admin-user", JSON.stringify(user))
        const role = user?.role_code || user?.role?.code
        router.replace(["admin", "organizer", "employee", "back_office"].includes(role) ? "/admin" : "/dashboard")
      })
      .catch(() => {
        window.localStorage.removeItem("stylish-events-admin-token")
        window.localStorage.removeItem("stylish-events-auth-token")
        window.localStorage.removeItem("stylish-events-token")
        window.localStorage.removeItem("stylish-events-admin-user")
        window.localStorage.removeItem("stylish-events-admin-profile")
      })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await platformApi.login({ login, password })
      window.localStorage.setItem("stylish-events-admin-token", result.token)
      window.localStorage.setItem("stylish-events-admin-user", JSON.stringify(result.user))
      const role = result.user?.role_code || result.user?.role?.code
      const next = new URLSearchParams(window.location.search).get("next")
      window.location.href = ["admin", "organizer", "employee", "back_office"].includes(role)
        ? next || "/admin"
        : next || "/dashboard"
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : text.errorFallback)
    } finally {
      setIsLoading(false)
    }
  }

  const logoSrc = apiAssetUrl(isRtl ? theme?.logoArUrl : theme?.logoEnUrl) || (isRtl ? "/LogoAR.png" : "/logo.png")
  const themeStyle = useMemo(
    () =>
      ({
        "--login-primary": theme?.primaryColor || "var(--admin-primary, #EA580C)",
        "--login-secondary": theme?.secondaryColor || "var(--admin-secondary, #0f172a)",
        "--login-accent": theme?.accentColor || "var(--admin-accent, #2563EB)",
      }) as React.CSSProperties,
    [theme],
  )

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-slate-50 text-slate-950 lg:overflow-hidden" dir={isRtl ? "rtl" : "ltr"} style={themeStyle}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 16%, rgba(255,255,255,.94), transparent 24%), radial-gradient(circle at 88% 10%, color-mix(in srgb, var(--login-primary) 18%, transparent), transparent 28%), linear-gradient(135deg, #f8fbff 0%, color-mix(in srgb, var(--login-primary) 10%, white) 42%, color-mix(in srgb, var(--login-accent) 24%, white) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[44%]"
        style={{
          background: "radial-gradient(ellipse at 48% 100%, color-mix(in srgb, var(--login-primary) 22%, transparent), transparent 46%)",
        }}
      />
      <div
        className="absolute bottom-[9%] left-[-10%] h-52 w-[120%] rotate-[-5deg] rounded-[50%] blur-sm"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,.72), color-mix(in srgb, var(--login-primary) 15%, white), color-mix(in srgb, var(--login-accent) 24%, white))",
        }}
      />
      <div className="absolute bottom-[13%] left-[-8%] h-36 w-[115%] rotate-[-7deg] rounded-[50%] border-t border-white/60 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 0%, transparent 48%, rgba(255,255,255,.58) 49%, transparent 51%), radial-gradient(circle, color-mix(in srgb, var(--login-primary) 16%, transparent) 1px, transparent 1.8px)",
          backgroundSize: "210px 210px, 88px 88px",
        }}
      />

      <section className="relative z-10 mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-6 px-4 py-5 sm:px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-12 lg:py-8">
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6 md:left-8 lg:left-12">
          <Link href="/" aria-label="Go to homepage" className="block transition hover:opacity-85">
            <img src={logoSrc} alt="Stylish Events" className="h-10 w-auto object-contain sm:h-12" draggable={false} />
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="hidden pt-24 lg:block lg:pt-10">
          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em]" style={{ color: "color-mix(in srgb, var(--login-primary) 42%, white)" }}>
              {text.future}
            </p>
            <AuthBrandHeadline isRtl={isRtl} color="var(--login-secondary)" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.42em]" style={{ color: "color-mix(in srgb, var(--login-primary) 26%, white)" }}>
              {text.brandLine}
            </p>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
              {text.description}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: isRtl ? -24 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="flex justify-center pt-16 lg:justify-end lg:pt-0"
        >
          <div className="w-full max-w-[430px] rounded-[12px] border border-white bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-7 lg:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{text.panelTitle}</h2>
              <button
                type="button"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                className="flex h-10 min-w-12 items-center justify-center rounded-[8px] bg-slate-50 px-3 text-sm font-bold text-primary shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
                aria-label={text.toggleLanguage}
              >
                {text.languageButton}
              </button>
            </div>

            <div className="mb-5 flex gap-7 border-b border-slate-200/75">
              <button type="button" className="border-b-2 border-primary pb-3 text-sm font-bold text-slate-900">
                {text.emailTab}
              </button>
            </div>

            {error && <div className="mb-4 rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-sm font-semibold text-slate-900">
                  {text.loginLabel}
                </Label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
                  <Input
                    id="login"
                    type="text"
                    placeholder={text.loginPlaceholder}
                    className={`h-12 rounded-[6px] border-0 bg-slate-50/85 text-base font-medium text-slate-700 shadow-none ring-1 ring-slate-200/70 transition focus-visible:ring-2 focus-visible:ring-primary/35 sm:h-14 ${
                      isRtl ? "pr-12 text-right" : "pl-12"
                    }`}
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-900">
                    {text.passwordLabel}
                  </Label>
                  <Link href="/forgot-password" className="text-sm font-bold text-primary transition hover:opacity-80">
                    {text.forgot}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-12 rounded-[6px] border-0 bg-slate-50/85 text-base font-medium text-slate-700 shadow-none ring-1 ring-slate-200/70 transition focus-visible:ring-2 focus-visible:ring-primary/35 sm:h-14 ${
                      isRtl ? "pl-12 pr-12 text-right" : "pl-12 pr-12"
                    }`}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? text.hidePassword : text.showPassword}
                    className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[4px] text-slate-500 transition hover:bg-white hover:text-slate-900 ${
                      isRtl ? "left-1" : "right-1"
                    }`}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <label htmlFor="remember" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-slate-500">
                <Checkbox id="remember" className="h-5 w-5 rounded-[4px] border-primary data-[state=checked]:bg-primary" />
                <span>{text.remember}</span>
              </label>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-[6px] bg-gradient-to-r from-primary to-[color:var(--login-accent)] text-base font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition hover:opacity-95 active:scale-[0.99]"
              >
                {isLoading ? text.loading : text.submit}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm font-semibold text-slate-500">
              {text.registerText}{" "}
              <Link href="/signup" className="font-bold text-primary transition hover:opacity-80">
                {text.register}
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>{text.secureAccess}</span>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
