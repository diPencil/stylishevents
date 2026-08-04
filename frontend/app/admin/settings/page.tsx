"use client"

import { Settings2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"
import { ThemeSettingsPanel } from "@/components/admin/theme-settings-panel"
import { SiteContentSettingsPanel } from "@/components/admin/site-content-settings-panel"
import { CurrencySettingsPanel } from "@/components/admin/currency-settings-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function AdminSettingsPage() {
  const { language } = useLanguage()
  const isRtl = language === "ar"

  return (
    <div className={cn("admin-settings-page space-y-5", isRtl && "text-right")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]">
            <Settings2 className="h-3.5 w-3.5" />
            {adminT(language, "settings.workspace")}
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#10132d] md:text-3xl">{adminT(language, "settings.title")}</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500 md:text-[15px]">
          {adminT(language, "settings.subtitle")}
          </p>
        </div>
      </div>
      <Tabs defaultValue="theme" className="space-y-5">
        <div className="settings-tabs-scroll w-full overflow-x-auto pb-1">
        <TabsList className="grid h-auto min-w-[680px] rounded-[20px] bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.06)] lg:w-[760px] lg:grid-cols-3">
          <TabsTrigger value="theme" className="rounded-xl py-2.5 font-extrabold">{adminT(language, "settings.themeIdentity")}</TabsTrigger>
          <TabsTrigger value="website" className="rounded-xl py-2.5 font-extrabold">{adminT(language, "settings.websiteContent")}</TabsTrigger>
          <TabsTrigger value="currency" className="rounded-xl py-2.5 font-extrabold">{adminT(language, "settings.currencyRates")}</TabsTrigger>
        </TabsList>
        </div>
        <TabsContent value="theme" className="mt-0">
          <ThemeSettingsPanel />
        </TabsContent>
        <TabsContent value="website" className="mt-0">
          <SiteContentSettingsPanel />
        </TabsContent>
        <TabsContent value="currency" className="mt-0">
          <CurrencySettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
