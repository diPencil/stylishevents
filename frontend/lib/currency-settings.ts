"use client"

export type CurrencyCode = "USD" | "EGP" | "SAR" | "AED" | "EUR" | "GBP" | "KWD" | "QAR"

export type CurrencyRate = {
  code: CurrencyCode
  name: string
  symbol: string
  enabled: boolean
  rate: number
}

export type CurrencySettings = {
  baseCurrency: CurrencyCode
  defaultCustomerCurrency: CurrencyCode
  symbolPosition: "before" | "after"
  decimalPlaces: "0" | "2"
  rates: CurrencyRate[]
}

export const currencySettingsStorageKey = "stylish-events-currency-settings"

export const defaultCurrencySettings: CurrencySettings = {
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

export function mergeCurrencyRates(savedRates: CurrencyRate[]) {
  return defaultCurrencySettings.rates.map((rate) => {
    const saved = savedRates.find((item) => item.code === rate.code)
    return saved ? { ...rate, ...saved, rate: Number(saved.rate) || rate.rate } : rate
  })
}

export function readCurrencySettings(): CurrencySettings {
  if (typeof window === "undefined") return defaultCurrencySettings

  try {
    const saved = window.localStorage.getItem(currencySettingsStorageKey)
    if (!saved) return defaultCurrencySettings
    const parsed = JSON.parse(saved) as Partial<CurrencySettings>

    return {
      ...defaultCurrencySettings,
      ...parsed,
      rates: parsed.rates?.length ? mergeCurrencyRates(parsed.rates as CurrencyRate[]) : defaultCurrencySettings.rates,
    }
  } catch {
    return defaultCurrencySettings
  }
}

export function enabledCurrencyRates(settings: CurrencySettings = readCurrencySettings()) {
  const enabled = settings.rates.filter((rate) => rate.enabled)
  return enabled.length ? enabled : defaultCurrencySettings.rates.filter((rate) => rate.enabled)
}

export function formatCurrencyAmount(value: number, currencyCode: string, settings: CurrencySettings = readCurrencySettings()) {
  const currency = settings.rates.find((rate) => rate.code === currencyCode) || settings.rates.find((rate) => rate.code === settings.baseCurrency) || defaultCurrencySettings.rates[0]
  const digits = Number(settings.decimalPlaces)
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0)

  return settings.symbolPosition === "before" ? `${currency.symbol} ${formatted}` : `${formatted} ${currency.symbol}`
}

