"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Paintbrush, Save, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { ImageUrlDropzone } from "@/components/admin/image-url-dropzone"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"
import { apiAssetUrl, platformApi } from "@/lib/platform-api"
import { applyPlatformTheme, cleanPlatformThemeAssets, defaultPlatformTheme, platformFontStack, platformThemeStorageKey } from "@/lib/platform-theme"
import type { PlatformThemeSettings } from "@/types/platform"

const defaultTheme = defaultPlatformTheme
const applyTheme = applyPlatformTheme
const cleanThemeAssets = cleanPlatformThemeAssets

export function ThemeSettingsPanel() {
  const { language } = useLanguage()
  const isAr = language === "ar"
  const [theme, setTheme] = useState<PlatformThemeSettings>(defaultTheme)
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle")

  useEffect(() => {
    const saved = localStorage.getItem(platformThemeStorageKey)
    if (saved) {
      const parsed = cleanThemeAssets({ ...defaultTheme, ...JSON.parse(saved) })
      setTheme(parsed)
      applyTheme(parsed)
    }
    platformApi.getThemeSettings()
      .then((remote) => {
        const parsed = cleanThemeAssets({ ...defaultTheme, ...(remote || {}) })
        setTheme(parsed)
        applyTheme(parsed)
        localStorage.setItem(platformThemeStorageKey, JSON.stringify(parsed))
      })
      .catch(() => {
        if (!saved) applyTheme(defaultTheme)
      })
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const buttonClass = useMemo(() => {
    if (theme.buttonStyle === "outline") return "border-2 bg-transparent text-primary hover:bg-primary/10"
    if (theme.buttonStyle === "soft") return "bg-primary/10 text-primary hover:bg-primary/15"
    return "bg-primary text-primary-foreground hover:bg-primary/90"
  }, [theme.buttonStyle])

  const updateTheme = <K extends keyof PlatformThemeSettings>(key: K, value: PlatformThemeSettings[K]) => {
    setTheme((current) => ({ ...current, [key]: value }))
    setSaveState("idle")
  }

  const updateColor = (key: "primaryColor" | "secondaryColor" | "accentColor", value: string) => {
    updateTheme(key, value)
  }

  const saveTheme = async () => {
    try {
      const saved = await platformApi.updateThemeSettings(theme)
      const next = { ...defaultTheme, ...(saved || theme) }
      localStorage.setItem(platformThemeStorageKey, JSON.stringify(next))
      window.dispatchEvent(new CustomEvent("stylish-events-theme-settings-updated", { detail: next }))
      setSaveState("saved")
      toast.success(isAr ? "تم حفظ إعدادات الثيم" : "Theme settings saved", {
        description: isAr ? "تم حفظ إعدادات الثيم في MySQL." : "Theme settings are now stored in MySQL.",
      })
    } catch (error) {
      localStorage.setItem(platformThemeStorageKey, JSON.stringify(theme))
      window.dispatchEvent(new CustomEvent("stylish-events-theme-settings-updated", { detail: theme }))
      setSaveState("saved")
      toast.error(isAr ? "تم الحفظ محليا فقط" : "Saved locally only", {
        description: error instanceof Error ? error.message : (isAr ? "واجهة إعدادات الباك إند غير متاحة حاليا." : "Backend settings API is not reachable."),
      })
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <CardHeader className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
                <Paintbrush className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold text-[#10132d]">{adminT(language, "settings.themeIdentityTitle")}</CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                  {isAr ? "تحكم في اللوجوهات، الألوان، الخطوط، الاستدارة، وسلوك الأزرار داخل تجربة الإدارة." : "Logos, colors, typography, radius, and button behavior for the admin experience."}
                </CardDescription>
              </div>
            </div>
            <Badge className="w-fit rounded-xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.10)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isAr ? "ثيم مباشر" : "Live theme"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-5">
          <section className="rounded-[24px] bg-slate-50 p-4">
            <SectionHeading
              title={isAr ? "ملفات الهوية" : "Brand assets"}
              description={isAr ? "ارفع اللوجوهات أو أضف روابطها مع أيقونة المتصفح المستخدمة في الموقع." : "Upload or paste URLs for the public logo set and browser icon."}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ImageUrlDropzone
                label={adminT(language, "settings.englishLogo")}
                value={theme.logoEnUrl}
                onChange={(value) => updateTheme("logoEnUrl", value)}
                placeholder="/stylish-logo.svg"
                className="md:col-span-2"
                previewClassName="sm:w-[150px]"
              />
              <ImageUrlDropzone
                label={adminT(language, "settings.arabicLogo")}
                value={theme.logoArUrl}
                onChange={(value) => updateTheme("logoArUrl", value)}
                placeholder="/stylish-logo-ar.svg"
              />
              <ImageUrlDropzone
                label={adminT(language, "settings.favicon")}
                value={theme.faviconUrl}
                onChange={(value) => updateTheme("faviconUrl", value)}
                placeholder="/stylish-favicon.svg"
              />
            </div>
          </section>

          <section className="rounded-[24px] bg-slate-50 p-4">
            <SectionHeading
              title={isAr ? "نظام الألوان" : "Color system"}
              description={isAr ? "هذه القيم تتحكم في السيدبار، الأزرار، التمييز، وألوان الداشبورد الأساسية." : "These values drive the sidebar, buttons, highlights, and dashboard accents."}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                ["primaryColor", "settings.primaryColor"],
                ["secondaryColor", "settings.secondaryColor"],
                ["accentColor", "settings.accentColor"],
              ].map(([key, label]) => {
                const colorKey = key as "primaryColor" | "secondaryColor" | "accentColor"
                return (
                  <div key={key} className="rounded-[20px] bg-white p-3 shadow-sm">
                    <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{adminT(language, label)}</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        type="color"
                        value={theme[colorKey]}
                        onChange={(event) => updateColor(colorKey, event.target.value)}
                        className="h-11 w-14 shrink-0 rounded-2xl border-slate-200 bg-white p-1"
                      />
                      <Input
                        value={theme[colorKey]}
                        onChange={(event) => updateColor(colorKey, event.target.value)}
                        className="h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-[24px] bg-slate-50 p-4">
            <SectionHeading
              title={isAr ? "الخطوط والتحكم" : "Typography & controls"}
              description={isAr ? "اضبط شكل واجهة الإدارة اليومية بدون تعديل كود الصفحات." : "Tune the daily admin interface without changing page code."}
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[20px] bg-white p-3 shadow-sm">
                <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{isAr ? "الخط الإنجليزي" : "English Font"}</Label>
                <Select value={theme.fontFamily} onValueChange={(value) => updateTheme("fontFamily", value)}>
                  <SelectTrigger className="mt-2 h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Rubik">Rubik</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Cairo">Cairo</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Tahoma">Tahoma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-[20px] bg-white p-3 shadow-sm">
                <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{isAr ? "الخط العربي" : "Arabic Font"}</Label>
                <Select value={theme.fontFamilyAr || "Cairo"} onValueChange={(value) => updateTheme("fontFamilyAr", value)}>
                  <SelectTrigger className="mt-2 h-11 rounded-2xl border-slate-200 bg-slate-50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cairo">Cairo</SelectItem>
                    <SelectItem value="Tahoma">Tahoma</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-[20px] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{adminT(language, "settings.radius")}</Label>
                  <span className="rounded-xl bg-[hsl(var(--primary)/0.10)] px-3 py-1 text-xs font-extrabold text-[hsl(var(--primary))]">{theme.radius}px</span>
                </div>
                <Slider
                  className="mt-5"
                  value={[Number(theme.radius)]}
                  min={4}
                  max={28}
                  step={1}
                  onValueChange={([value]) => updateTheme("radius", String(value))}
                />
              </div>

              <div className="rounded-[20px] bg-white p-3 shadow-sm">
                <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{adminT(language, "settings.buttonStyle")}</Label>
                <Tabs value={theme.buttonStyle} onValueChange={(value) => updateTheme("buttonStyle", value as PlatformThemeSettings["buttonStyle"])}>
                  <TabsList className="mt-2 grid h-auto w-full grid-cols-3 rounded-2xl bg-slate-100 p-1">
                    <TabsTrigger value="solid" className="rounded-xl font-extrabold">{adminT(language, "settings.solid")}</TabsTrigger>
                    <TabsTrigger value="soft" className="rounded-xl font-extrabold">{adminT(language, "settings.soft")}</TabsTrigger>
                    <TabsTrigger value="outline" className="rounded-xl font-extrabold">{adminT(language, "settings.outline")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="rounded-[20px] bg-white p-3 shadow-sm">
                <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{adminT(language, "settings.density")}</Label>
                <Tabs value={theme.density} onValueChange={(value) => updateTheme("density", value as PlatformThemeSettings["density"])}>
                  <TabsList className="mt-2 grid h-auto w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
                    <TabsTrigger value="comfortable" className="rounded-xl font-extrabold">{adminT(language, "settings.comfortable")}</TabsTrigger>
                    <TabsTrigger value="compact" className="rounded-xl font-extrabold">{adminT(language, "settings.compact")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 rounded-[24px] bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[hsl(var(--primary))] shadow-sm">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <p className="font-extrabold text-[#10132d]">{adminT(language, "settings.applyTheme")}</p>
                <p className="text-sm font-semibold text-slate-500">{adminT(language, "settings.applyThemeCopy")}</p>
              </div>
            </div>
            <ConfirmAction
              title={isAr ? "تأكيد حفظ الثيم" : "Confirm theme save"}
              description={isAr ? "سيتم تطبيق الألوان والخط واللوجوهات وأيقونة الموقع على واجهة الإدارة." : "The colors, font, logos, and favicon settings will be applied to the admin UI."}
              confirmLabel={isAr ? "حفظ الإعدادات" : "Save settings"}
              onConfirm={saveTheme}
              tone="success"
            >
              <Button className="h-11 rounded-2xl px-5 font-extrabold">
                <Save className="h-4 w-4" />
                {saveState === "saved" ? adminT(language, "common.saved") : adminT(language, "common.save")}
              </Button>
            </ConfirmAction>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <CardHeader className="border-b border-slate-100 p-5">
          <CardTitle className="text-xl font-extrabold text-[#10132d]">{adminT(language, "common.preview")}</CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-500">{adminT(language, "common.responsiveReady")}</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4 rounded-[24px] bg-slate-50 p-4" style={{ fontFamily: platformFontStack(theme.fontFamily) }}>
            <div className="flex items-center justify-between gap-3 rounded-[20px] bg-white p-3 shadow-sm">
              <img src={apiAssetUrl(language === "ar" ? theme.logoArUrl : theme.logoEnUrl) || "/stylish-logo.svg"} alt={isAr ? "معاينة لوجو Stylish Events" : "Stylish Events logo preview"} className="h-10 max-w-[190px] object-contain" />
              <img src={apiAssetUrl(theme.faviconUrl) || "/stylish-favicon.svg"} alt={isAr ? "معاينة أيقونة الموقع" : "Favicon preview"} className="h-8 w-8 rounded-xl object-contain" />
            </div>
            <div className="min-h-[140px] rounded-[24px] p-5 text-white shadow-[0_18px_35px_rgba(15,23,42,0.14)]" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` }}>
              <p className="text-sm font-extrabold opacity-80">Stylish Events</p>
              <p className="mt-3 max-w-[260px] text-2xl font-extrabold leading-tight">{language === "ar" ? "القمة الرقمية" : "Digital Summit"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PreviewMetric label={adminT(language, "nav.orders")} value="1,248" />
              <PreviewMetric label={adminT(language, "nav.attendees")} value="3,904" />
            </div>
            <button className={`h-11 w-full rounded-2xl px-4 text-sm font-extrabold transition ${buttonClass}`}>
              {isAr ? "إنشاء تذكرة" : "Create Ticket"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-base font-extrabold text-[#10132d]">{title}</h3>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white p-3 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-[#10132d]">{value}</p>
    </div>
  )
}

