"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Building2, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, Upload, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CountrySelect } from "@/components/country-select"
import { AuthBrandHeadline } from "@/components/auth/auth-brand-headline"
import { useLanguage } from "@/contexts/language-context"
import { applyCountryDialCode } from "@/lib/country-dial-codes"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { normalizePlatformTheme, readSavedPlatformTheme, resolvePlatformTheme } from "@/lib/platform-theme"
import type { PlatformThemeSettings } from "@/types/platform"

const copy = {
  en: {
    logoAlt: "Stylish Events",
    eyebrow: "Customer Account",
    title: "Create your account",
    intro: "Complete your profile once, then use it for bookings, tickets, QR access, and certificates.",
    step: "Step",
    of: "of",
    contact: "Contact info",
    contactText: "Your booking identity and country-based currency.",
    profile: "Profile details",
    profileText: "Optional details and your customer avatar.",
    security: "Secure access",
    securityText: "Create a password and confirm platform terms.",
    fullName: "Full name",
    username: "Username",
    email: "Email address",
    country: "Country",
    phone: "Phone number",
    gender: "Gender",
    male: "Male",
    female: "Female",
    notSpecified: "Not specified",
    company: "Company",
    avatar: "Avatar image",
    avatarUrl: "Image URL",
    upload: "Upload",
    clear: "Clear",
    password: "Password",
    agree: "I agree to the terms and privacy policy",
    next: "Next",
    back: "Back",
    submit: "Create Account",
    loading: "Creating account...",
    loginText: "Already have an account?",
    login: "Log in",
    success: "Account created successfully",
    errorFallback: "Could not create account",
    requiredFallback: "Please complete the required fields first.",
    avatarUploadFailed: "Avatar upload failed",
    avatarPreview: "Avatar preview",
    toggleLanguage: "Toggle language",
    hidePassword: "Hide password",
    showPassword: "Show password",
    languageButton: "AR",
    secure: "Secure registration",
  },
  ar: {
    logoAlt: "Stylish Events",
    eyebrow: "حساب العميل",
    title: "إنشاء حساب جديد",
    intro: "أكمل بياناتك مرة واحدة لاستخدامها في الحجوزات، التذاكر، دخول QR، والشهادات.",
    step: "خطوة",
    of: "من",
    contact: "بيانات التواصل",
    contactText: "هوية الحجز والعملة حسب الدولة.",
    profile: "بيانات البروفايل",
    profileText: "تفاصيل اختيارية وصورة حساب العميل.",
    security: "الدخول الآمن",
    securityText: "أنشئ كلمة المرور ووافق على شروط المنصة.",
    fullName: "الاسم بالكامل",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    country: "الدولة",
    phone: "رقم الهاتف",
    gender: "النوع",
    male: "ذكر",
    female: "أنثى",
    notSpecified: "غير محدد",
    company: "الشركة",
    avatar: "الصورة الشخصية",
    avatarUrl: "رابط الصورة",
    upload: "رفع",
    clear: "مسح",
    password: "كلمة المرور",
    agree: "أوافق على الشروط وسياسة الخصوصية",
    next: "التالي",
    back: "رجوع",
    submit: "إنشاء الحساب",
    loading: "جاري إنشاء الحساب...",
    loginText: "لديك حساب بالفعل؟",
    login: "تسجيل الدخول",
    success: "تم إنشاء الحساب بنجاح",
    errorFallback: "تعذر إنشاء الحساب",
    requiredFallback: "من فضلك أكمل الحقول المطلوبة أولًا.",
    avatarUploadFailed: "فشل رفع الصورة الشخصية",
    avatarPreview: "معاينة الصورة الشخصية",
    toggleLanguage: "تغيير اللغة",
    hidePassword: "إخفاء كلمة المرور",
    showPassword: "إظهار كلمة المرور",
    languageButton: "EN",
    secure: "تسجيل آمن",
  },
}

const stepKeys = ["contact", "profile", "security"] as const

export default function SignUp() {
  const router = useRouter()
  const { language, setLanguage, isRtl } = useLanguage()
  const text = copy[language]
  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [theme, setTheme] = useState<PlatformThemeSettings | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    company: "",
    email: "",
    phone: "+20 ",
    countryCode: "EG",
    countryName: "Egypt",
    gender: "not_specified",
    avatarUrl: "",
    password: "",
    agreeTerms: false,
  })

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

  function setField(name: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function canLeaveStep(step: number) {
    if (step === 0) return Boolean(formData.fullName.trim() && formData.email.trim() && formData.phone.trim())
    if (step === 2) return Boolean(formData.password.trim() && formData.agreeTerms)
    return true
  }

  function goNext() {
    setError("")
    if (!canLeaveStep(currentStep)) {
      setError(text.requiredFallback)
      return
    }
    setCurrentStep((step) => Math.min(step + 1, stepKeys.length - 1))
  }

  async function handleAvatarUpload(file?: File | null) {
    if (!file) return
    setError("")

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const result = await platformApi.uploadAuthAvatar({
          fileName: file.name,
          dataUrl: String(reader.result || ""),
        })
        setField("avatarUrl", result.url)
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : text.avatarUploadFailed)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canLeaveStep(2)) {
      setError(text.requiredFallback)
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await platformApi.register({
        name: formData.fullName,
        username: formData.username || null,
        company: formData.company || null,
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        countryName: formData.countryName,
        gender: formData.gender,
        preferredLanguage: language,
        avatarUrl: formData.avatarUrl || null,
        password: formData.password,
      })
      window.localStorage.setItem("stylish-events-auth-token", result.token)
      window.localStorage.setItem("stylish-events-admin-user", JSON.stringify(result.user))
      setSuccess(text.success)
      router.replace("/customer")
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : text.errorFallback)
    } finally {
      setIsLoading(false)
    }
  }

  const logoSrc = apiAssetUrl(isRtl ? theme?.logoArUrl : theme?.logoEnUrl) || (isRtl ? "/LogoAR.png" : "/logo.png")
  const pageStyle = useMemo(
    () =>
      ({
        "--signup-primary": theme?.primaryColor || "var(--admin-primary, #EA580C)",
        "--signup-secondary": theme?.secondaryColor || "var(--admin-secondary, #0f172a)",
        "--signup-accent": theme?.accentColor || "var(--admin-accent, #2563EB)",
      }) as React.CSSProperties,
    [theme],
  )

  const activeKey = stepKeys[currentStep]
  const activeTitle = text[activeKey]
  const activeDescription = text[`${activeKey}Text` as const]

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-slate-50 text-slate-950 lg:h-screen lg:overflow-hidden" dir={isRtl ? "rtl" : "ltr"} style={pageStyle}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 10% 14%, rgba(255,255,255,.96), transparent 25%), radial-gradient(circle at 90% 12%, color-mix(in srgb, var(--signup-primary) 15%, transparent), transparent 30%), linear-gradient(135deg, #f8fbff 0%, color-mix(in srgb, var(--signup-primary) 8%, white) 45%, color-mix(in srgb, var(--signup-accent) 20%, white) 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--signup-primary) 16%, transparent) 1px, transparent 1.8px)", backgroundSize: "88px 88px" }} />
      <div className="absolute bottom-[-12%] left-[-10%] h-72 w-[120%] rotate-[-5deg] rounded-[50%] bg-white/45 blur-sm" />

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:h-full lg:px-10 lg:py-7">
        <div className="flex shrink-0 items-center justify-between gap-4">
          <Link href="/" aria-label="Go to homepage" className="block transition hover:opacity-85">
            <img src={logoSrc} alt={text.logoAlt} className="h-10 w-auto object-contain sm:h-12" draggable={false} />
          </Link>
          <button
            type="button"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="flex h-11 min-w-12 items-center justify-center rounded-[8px] bg-white px-3 text-sm font-bold text-primary shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            aria-label={text.toggleLanguage}
          >
            {text.languageButton}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center py-4 lg:py-5">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-[720px]">
            <div className="max-h-[calc(100dvh-104px)] overflow-y-auto rounded-[18px] border border-white bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.13)] sm:p-5 md:p-6 lg:max-h-none lg:overflow-visible lg:p-7">
              <div className="mb-4 text-center sm:mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">{text.eyebrow}</p>
                <div className="mx-auto flex justify-center">
                  <AuthBrandHeadline isRtl={isRtl} color="var(--signup-secondary)" size="compact" />
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl lg:text-4xl">{text.title}</h1>
                <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">{text.intro}</p>
              </div>

              <Stepper currentStep={currentStep} />

              <div className="mb-5 mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  {text.step} {currentStep + 1} {text.of} {stepKeys.length} - {activeTitle}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{activeDescription}</p>
              </div>

              {error && <div className="mb-4 rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
              {success && <div className="mb-4 rounded-[8px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="min-h-[250px] sm:min-h-[260px]">
                  <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                      <StepPanel key="contact">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <AuthInput icon={User} label={text.fullName} name="fullName" value={formData.fullName} onChange={setField} required />
                          <AuthInput icon={Mail} label={text.email} name="email" type="email" value={formData.email} onChange={setField} required />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
                          <CountrySelect
                            label={text.country}
                            value={{ code: formData.countryCode, name: formData.countryName }}
                            onChange={(country) => {
                              setFormData((prev) => ({
                                ...prev,
                                countryCode: country.code,
                                countryName: country.name,
                                phone: applyCountryDialCode(prev.phone, country.code),
                              }))
                            }}
                          />
                          <AuthInput icon={Phone} label={text.phone} name="phone" type="tel" dir="ltr" value={formData.phone} onChange={setField} required />
                        </div>
                      </StepPanel>
                    )}

                    {currentStep === 1 && (
                      <StepPanel key="profile">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <AuthInput icon={User} label={text.username} name="username" value={formData.username} onChange={setField} />
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-900">{text.gender}</Label>
                            <Select value={formData.gender} onValueChange={(gender) => setField("gender", gender)}>
                              <SelectTrigger className="h-14 rounded-[8px] border-0 bg-white font-medium ring-1 ring-slate-200/80">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_specified">{text.notSpecified}</SelectItem>
                                <SelectItem value="male">{text.male}</SelectItem>
                                <SelectItem value="female">{text.female}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <AuthInput icon={Building2} label={text.company} name="company" value={formData.company} onChange={setField} />
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-900">{text.avatar}</Label>
                            <div className="grid gap-2 min-[420px]:grid-cols-[1fr_64px]">
                              <Input value={formData.avatarUrl} onChange={(e) => setField("avatarUrl", e.target.value)} placeholder={text.avatarUrl} className="h-12 rounded-[8px] border-0 bg-white font-medium ring-1 ring-slate-200/80 sm:h-14" />
                              <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-[10px] bg-white ring-1 ring-slate-200/80 sm:h-14">
                                {formData.avatarUrl ? <img src={apiAssetUrl(formData.avatarUrl)} alt={text.avatarPreview} className="h-full w-full object-cover" /> : <User className="h-6 w-6 text-slate-300" />}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                <Upload className="h-4 w-4" /> {text.upload}
                                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => handleAvatarUpload(event.target.files?.[0])} />
                              </label>
                              <Button type="button" variant="outline" className="h-9 rounded-[8px] px-3 text-sm font-bold text-red-600" onClick={() => setField("avatarUrl", "")}>
                                <X className="h-4 w-4" /> {text.clear}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </StepPanel>
                    )}

                    {currentStep === 2 && (
                      <StepPanel key="security">
                        <div className="relative">
                          <AuthInput icon={Lock} label={text.password} name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={setField} required />
                          <button
                            type="button"
                            aria-label={showPassword ? text.hidePassword : text.showPassword}
                            className={`absolute bottom-1 flex h-11 w-11 items-center justify-center rounded-[6px] text-slate-500 transition hover:bg-white hover:text-slate-900 ${isRtl ? "left-1" : "right-1"}`}
                            onClick={() => setShowPassword((current) => !current)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <label htmlFor="agreeTerms" className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] bg-white px-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-200/80">
                          <Checkbox id="agreeTerms" checked={formData.agreeTerms} onCheckedChange={(checked) => setField("agreeTerms", checked === true)} className="h-5 w-5 rounded-[4px] border-primary data-[state=checked]:bg-primary" />
                          <span>{text.agree}</span>
                        </label>
                        <div className="flex items-center gap-2 rounded-[10px] bg-primary/5 px-4 py-3 text-sm font-semibold text-slate-500">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          <span>{text.secure}</span>
                        </div>
                      </StepPanel>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-center text-sm font-semibold text-slate-500 sm:text-start">
                    {text.loginText}{" "}
                    <Link href="/login" className="font-bold text-primary transition hover:opacity-80">
                      {text.login}
                    </Link>
                  </div>
                  <div className="flex gap-3 sm:min-w-[280px]">
                    {currentStep > 0 && (
                      <Button type="button" variant="outline" className="h-12 flex-1 rounded-[8px] font-bold" onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}>
                        {text.back}
                      </Button>
                    )}
                    {currentStep < stepKeys.length - 1 ? (
                      <Button type="button" className="h-12 flex-1 rounded-[8px] bg-gradient-to-r from-primary to-[color:var(--signup-accent)] text-base font-bold text-white" onClick={goNext}>
                        {text.next}
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isLoading || !formData.agreeTerms} className="h-12 flex-1 rounded-[8px] bg-gradient-to-r from-primary to-[color:var(--signup-accent)] text-base font-bold text-white">
                        {isLoading ? text.loading : text.submit}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-3">
      {stepKeys.map((_, index) => {
        const active = index <= currentStep
        return (
          <div key={index} className="flex flex-1 items-center gap-3 last:flex-none">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm transition ${
                active ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {index + 1}
            </div>
            {index < stepKeys.length - 1 && <div className={`h-1 flex-1 rounded-full transition ${index < currentStep ? "bg-primary" : "bg-slate-100"}`} />}
          </div>
        )
      })}
    </div>
  )
}

function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.2 }}
      className="space-y-3 rounded-[14px] bg-slate-50/70 p-3 ring-1 ring-slate-100 sm:space-y-4 sm:p-4"
    >
      {children}
    </motion.div>
  )
}

function AuthInput({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  dir,
}: {
  icon: React.ElementType
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  type?: string
  required?: boolean
  dir?: "ltr" | "rtl"
}) {
  const { isRtl } = useLanguage()
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-semibold text-slate-900">
        {label}
      </Label>
      <div className="relative">
        <Icon className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
        <Input
          id={name}
          name={name}
          type={type}
          dir={dir}
          value={value}
          required={required}
          onChange={(e) => onChange(name, e.target.value)}
          className={`h-12 rounded-[8px] border-0 bg-white text-base font-medium text-slate-700 shadow-none ring-1 ring-slate-200/80 transition focus-visible:ring-2 focus-visible:ring-primary/35 sm:h-14 ${isRtl ? "pr-12 text-right" : "pl-12"}`}
        />
      </div>
    </div>
  )
}
