"use client"

import { useMemo } from "react"
import countries from "i18n-iso-countries"
import ar from "i18n-iso-countries/langs/ar.json"
import en from "i18n-iso-countries/langs/en.json"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { countryDialCode } from "@/lib/country-dial-codes"

countries.registerLocale(ar)
countries.registerLocale(en)

type CountryValue = {
  code: string
  name: string
  dialCode?: string
}

type CountrySelectProps = {
  label: string
  value: CountryValue
  onChange: (value: CountryValue) => void
  placeholder?: string
}

const preferredCodes = ["EG", "SA", "AE", "KW", "QA", "BH", "OM", "US", "GB"]

export function CountrySelect({ label, value, onChange, placeholder }: CountrySelectProps) {
  const { language } = useLanguage()

  const options = useMemo(() => {
    const names = countries.getNames(language, { select: "official" })
    const rows = Object.entries(names)
      .map(([code, name]) => ({ code, name, dialCode: countryDialCode(code) }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const preferred = preferredCodes
      .map((code) => rows.find((country) => country.code === code))
      .filter(Boolean) as CountryValue[]
    const rest = rows.filter((country) => !preferredCodes.includes(country.code))
    return { preferred, rest }
  }, [language])

  function handleChange(code: string) {
    const country = [...options.preferred, ...options.rest].find((item) => item.code === code)
    if (!country) return
    onChange(country)
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</Label>
      <Select value={value.code} onValueChange={handleChange}>
        <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white font-bold">
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent className="max-h-72 rounded-2xl">
          {options.preferred.map((country) => (
            <SelectItem key={`preferred-${country.code}`} value={country.code} className="font-bold">
              {country.name} {country.dialCode ? `(${country.dialCode})` : `(${country.code})`}
            </SelectItem>
          ))}
          <div className="my-1 h-px bg-slate-100" />
          {options.rest.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name} {country.dialCode ? `(${country.dialCode})` : `(${country.code})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
