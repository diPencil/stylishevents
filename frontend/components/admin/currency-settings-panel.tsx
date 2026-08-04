"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRightLeft, Banknote, Calculator, Save, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ConfirmAction } from "@/components/admin/confirm-action"
import { cn } from "@/lib/utils"
import { platformApi } from "@/lib/platform-api"
import { useLanguage } from "@/contexts/language-context"
import { adminT } from "@/lib/admin-translations"

type CurrencyCode = "USD" | "EGP" | "SAR" | "AED" | "EUR" | "GBP" | "KWD" | "QAR"

type CurrencyRate = {
  code: CurrencyCode
  name: string
  symbol: string
  enabled: boolean
  rate: number
}

type CurrencySettings = {
  baseCurrency: CurrencyCode
  defaultCustomerCurrency: CurrencyCode
  symbolPosition: "before" | "after"
  decimalPlaces: "0" | "2"
  rates: CurrencyRate[]
}

const storageKey = "stylish-events-currency-settings"

const defaultSettings: CurrencySettings = {
  baseCurrency: "USD",
  defaultCustomerCurrency: "EGP",
  symbolPosition: "before",
  decimalPlaces: "2",
  rates: [
    { code: "USD", name: "US Dollar", symbol: "$", enabled: true, rate: 1 },
    { code: "EGP", name: "Egyptian Pound", symbol: "EGP", enabled: true, rate: 48.25 },
    { code: "SAR", name: "Saudi Riyal", symbol: "SAR", enabled: true, rate: 3.75 },
    { code: "AED", name: "UAE Dirham", symbol: "AED", enabled: true, rate: 3.67 },
    { code: "EUR", name: "Euro", symbol: "EUR", enabled: true, rate: 0.92 },
    { code: "GBP", name: "British Pound", symbol: "GBP", enabled: false, rate: 0.78 },
    { code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD", enabled: false, rate: 0.31 },
    { code: "QAR", name: "Qatari Riyal", symbol: "QAR", enabled: false, rate: 3.64 },
  ],
}

function readSettings() {
  if (typeof window === "undefined") return defaultSettings

  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return defaultSettings
    const parsed = JSON.parse(saved) as Partial<CurrencySettings>
    return {
      ...defaultSettings,
      ...parsed,
      rates: parsed.rates?.length ? mergeRates(parsed.rates) : defaultSettings.rates,
    }
  } catch {
    return defaultSettings
  }
}

function mergeRates(savedRates: CurrencyRate[]) {
  return defaultSettings.rates.map((rate) => {
    const saved = savedRates.find((item) => item.code === rate.code)
    return saved ? { ...rate, ...saved, rate: Number(saved.rate) || rate.rate } : rate
  })
}

function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode, rates: CurrencyRate[]) {
  const fromRate = rates.find((rate) => rate.code === from)?.rate || 1
  const toRate = rates.find((rate) => rate.code === to)?.rate || 1
  return (amount / fromRate) * toRate
}

function formatAmount(value: number, currency: CurrencyRate, settings: CurrencySettings) {
  const digits = Number(settings.decimalPlaces)
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0)

  return settings.symbolPosition === "before" ? `${currency.symbol} ${formatted}` : `${formatted} ${currency.symbol}`
}

export function CurrencySettingsPanel() {
  const { language } = useLanguage()
  const [settings, setSettings] = useState<CurrencySettings>(defaultSettings)
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle")
  const [converter, setConverter] = useState({ amount: "100", from: "USD" as CurrencyCode, to: "EGP" as CurrencyCode })

  useEffect(() => {
    const localSettings = readSettings()
    setSettings(localSettings)
    platformApi.getCurrencySettings()
      .then((remote) => {
        if (!remote || !Object.keys(remote).length) return
        const next = { ...defaultSettings, ...remote, rates: remote.rates?.length ? mergeRates(remote.rates) : defaultSettings.rates }
        setSettings(next)
        localStorage.setItem(storageKey, JSON.stringify(next))
      })
      .catch(() => undefined)
  }, [])

  const enabledRates = useMemo(() => settings.rates.filter((rate) => rate.enabled), [settings.rates])
  const convertedValue = useMemo(
    () => convertAmount(Number(converter.amount) || 0, converter.from, converter.to, settings.rates),
    [converter, settings.rates]
  )
  const targetCurrency = settings.rates.find((rate) => rate.code === converter.to) || settings.rates[0]

  const updateSettings = <K extends keyof CurrencySettings>(key: K, value: CurrencySettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setSaveState("idle")
  }

  const updateRate = <K extends keyof CurrencyRate>(code: CurrencyCode, key: K, value: CurrencyRate[K]) => {
    setSettings((current) => ({
      ...current,
      rates: current.rates.map((rate) => {
        if (rate.code !== code) return rate
        if (key === "enabled" && code === current.baseCurrency) return { ...rate, enabled: true }
        return { ...rate, [key]: value }
      }),
    }))
    setSaveState("idle")
  }

  const saveSettings = async () => {
    try {
      const saved = await platformApi.updateCurrencySettings(settings)
      localStorage.setItem(storageKey, JSON.stringify(saved || settings))
      window.dispatchEvent(new Event("stylish-events-currency-settings-updated"))
      setSaveState("saved")
      toast.success(language === "ar" ? "تم حفظ إعدادات العملة" : "Currency settings saved", { description: language === "ar" ? "تم حفظ أسعار التحويل." : "Exchange rates are saved." })
    } catch (error) {
      localStorage.setItem(storageKey, JSON.stringify(settings))
      window.dispatchEvent(new Event("stylish-events-currency-settings-updated"))
      setSaveState("saved")
      toast.error("Saved locally only", { description: error instanceof Error ? error.message : "Backend settings API is not reachable." })
    }
  }

  return (
    <Card className="rounded-[26px] border-0 bg-white/92 shadow-[0_18px_45px_rgba(93,58,138,0.08)]">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-[#17172f]">
              <Banknote className="h-5 w-5 text-[hsl(var(--primary))]" />
              {language === "ar" ? "محول العملات وأسعار التحويل" : "Currency Converter & Exchange Rates"}
            </CardTitle>
            <CardDescription className="mt-2 text-sm font-medium text-slate-500">
              {language === "ar" ? "تحكم في العملة الأساسية للمشروع، عملات العملاء المتاحة، أسعار التحويل، وقواعد عرض السعر." : "Control the project base currency, enabled customer currencies, exchange rates, and price display rules."}
            </CardDescription>
          </div>
          <ConfirmAction
            title={language === "ar" ? "تأكيد حفظ إعدادات العملة" : "Confirm currency settings save"}
            description={language === "ar" ? "سيتم حفظ إعدادات العملة والمحول وأسعار التحويل لتسعير المشروع." : "Currency, converter, and exchange-rate settings will be saved for project pricing."}
            confirmLabel={language === "ar" ? "حفظ إعدادات العملة" : "Save currency settings"}
            onConfirm={saveSettings}
            tone="success"
          >
            <Button className="h-11 rounded-2xl px-5 font-extrabold">
              <Save className="h-4 w-4" />
              {saveState === "saved" ? "Saved" : "Save"}
            </Button>
          </ConfirmAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <SelectBlock
            label={language === "ar" ? "العملة الأساسية" : "Base currency"}
            value={settings.baseCurrency}
            onValueChange={(value) => {
              const next = value as CurrencyCode
              updateSettings("baseCurrency", next)
              updateRate(next, "enabled", true)
            }}
            options={settings.rates}
          />
          <SelectBlock
            label={language === "ar" ? "عملة العميل الافتراضية" : "Default customer currency"}
            value={settings.defaultCustomerCurrency}
            onValueChange={(value) => updateSettings("defaultCustomerCurrency", value as CurrencyCode)}
            options={enabledRates}
          />
          <SelectBlock
            label={language === "ar" ? "مكان رمز العملة" : "Symbol position"}
            value={settings.symbolPosition}
            onValueChange={(value) => updateSettings("symbolPosition", value as CurrencySettings["symbolPosition"])}
            options={[
              { code: "before", name: language === "ar" ? "قبل المبلغ" : "Before amount", symbol: "$", enabled: true, rate: 1 },
              { code: "after", name: language === "ar" ? "بعد المبلغ" : "After amount", symbol: "EGP", enabled: true, rate: 1 },
            ] as unknown as CurrencyRate[]}
          />
          <SelectBlock
            label="Decimal places"
            value={settings.decimalPlaces}
            onValueChange={(value) => updateSettings("decimalPlaces", value as CurrencySettings["decimalPlaces"])}
            options={[
              { code: "0", name: language === "ar" ? "بدون كسور" : "No decimals", symbol: "0", enabled: true, rate: 1 },
              { code: "2", name: language === "ar" ? "رقمان عشريان" : "Two decimals", symbol: ".00", enabled: true, rate: 1 },
            ] as unknown as CurrencyRate[]}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
          <div className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h3 className="text-lg font-extrabold text-[#17172f]">{adminT(language, "settings.exchangeRates")}</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {language === "ar" ? `يتم حفظ الأسعار على أساس: 1 ${settings.baseCurrency} يساوي قيمة العملة المستهدفة.` : `Rates are stored as: 1 ${settings.baseCurrency} equals target currency value.`}
                </p>
              </div>
              <span className="rounded-full bg-[hsl(var(--primary)/0.10)] px-3 py-1 text-xs font-extrabold text-[hsl(var(--primary))]">
                {language === "ar" ? `${enabledRates.length} عملات نشطة` : `${enabledRates.length} active currencies`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-start">
                <thead className="bg-slate-50 text-sm font-extrabold text-slate-500">
                  <tr>
                    <th className="px-5 py-4">{adminT(language, "common.currency")}</th>
                    <th className="px-5 py-4">{adminT(language, "settings.symbol")}</th>
                    <th className="px-5 py-4">{adminT(language, "settings.rate")}</th>
                    <th className="px-5 py-4">{adminT(language, "settings.preview")}</th>
                    <th className="px-5 py-4">{adminT(language, "settings.active")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settings.rates.map((rate) => {
                    const previewValue = convertAmount(100, settings.baseCurrency, rate.code, settings.rates)
                    return (
                      <tr key={rate.code} className={cn("bg-white", !rate.enabled && "opacity-55")}>
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-[#17172f]">{rate.code}</p>
                          <p className="text-xs font-bold text-slate-400">{rate.name}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Input
                            value={rate.symbol}
                            onChange={(event) => updateRate(rate.code, "symbol", event.target.value)}
                            className="h-10 w-24 rounded-2xl bg-slate-50 font-bold"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <Input
                            type="number"
                            min="0"
                            step="0.0001"
                            value={rate.code === settings.baseCurrency ? 1 : rate.rate}
                            disabled={rate.code === settings.baseCurrency}
                            onChange={(event) => updateRate(rate.code, "rate", Number(event.target.value))}
                            className="h-10 w-36 rounded-2xl bg-slate-50 font-bold"
                          />
                        </td>
                        <td className="px-5 py-4 text-sm font-extrabold text-slate-600">
                          {formatAmount(previewValue, rate, settings)}
                        </td>
                        <td className="px-5 py-4">
                          <Switch
                            checked={rate.enabled}
                            disabled={rate.code === settings.baseCurrency}
                            onCheckedChange={(checked) => updateRate(rate.code, "enabled", checked)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] bg-[#f8f5fb] p-4">
              <div className="rounded-[22px] bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <h3 className="text-lg font-extrabold text-[#17172f]">{adminT(language, "settings.converter")}</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{adminT(language, "common.amount")}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={converter.amount}
                      onChange={(event) => setConverter((current) => ({ ...current, amount: event.target.value }))}
                      className="h-12 rounded-2xl bg-slate-50 text-lg font-extrabold"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                    <SelectBlock label={language === "ar" ? "من" : "From"} value={converter.from} onValueChange={(value) => setConverter((current) => ({ ...current, from: value as CurrencyCode }))} options={enabledRates} compact />
                    <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]">
                      <ArrowRightLeft className="h-4 w-4" />
                    </div>
                    <SelectBlock label={language === "ar" ? "إلى" : "To"} value={converter.to} onValueChange={(value) => setConverter((current) => ({ ...current, to: value as CurrencyCode }))} options={enabledRates} compact />
                  </div>

                  <div className="rounded-[22px] bg-[#0f172a] p-5 text-white">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/50">{adminT(language, "settings.convertedAmount")}</p>
                    <p className="mt-2 text-3xl font-black">{formatAmount(convertedValue, targetCurrency, settings)}</p>
                    <p className="mt-2 text-xs font-bold text-white/50">
                      {language === "ar" ? "بناء على جدول أسعار التحويل المحفوظ." : "Based on your saved exchange-rate table."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-base font-extrabold text-[#17172f]">{adminT(language, "settings.pricingLogic")}</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm font-medium leading-6 text-slate-500">
                <p>{adminT(language, "settings.pricingLogicCopy1")}</p>
                <p>{adminT(language, "settings.pricingLogicCopy2")}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SelectBlock({
  label,
  value,
  onValueChange,
  options,
  compact,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: CurrencyRate[]
  compact?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("rounded-2xl bg-slate-50 font-extrabold", compact ? "h-11" : "h-12")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.code} value={option.code}>
              {option.code} {option.name ? `- ${option.name}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

