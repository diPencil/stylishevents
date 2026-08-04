import type { PlatformThemeSettings } from "@/types/platform"
import { apiAssetUrl } from "@/lib/platform-api"

export const platformThemeStorageKey = "stylish-events-theme-settings"

export const defaultPlatformTheme: PlatformThemeSettings = {
  primaryColor: "#EA580C",
  secondaryColor: "#0f172a",
  accentColor: "#2563EB",
  radius: "12",
  fontFamily: "Rubik",
  fontFamilyAr: "Cairo",
  buttonStyle: "solid",
  density: "comfortable",
  logoEnUrl: "/logo.png",
  logoArUrl: "/LogoAR.png",
  faviconUrl: "/favicon.png",
  footerLocationEn: "26 Tarablous Street, Abbas El Akkad, 2nd floor, Flat 5, Nasr City, Cairo, Egypt",
  footerLocationAr: "\u0662\u0666 \u0634\u0627\u0631\u0639 \u0637\u0631\u0627\u0628\u0644\u0633\u060c \u0639\u0628\u0627\u0633 \u0627\u0644\u0639\u0642\u0627\u062f\u060c \u0627\u0644\u062f\u0648\u0631 \u0627\u0644\u062b\u0627\u0646\u064a\u060c \u0634\u0642\u0629 \u0665\u060c \u0645\u062f\u064a\u0646\u0629 \u0646\u0635\u0631\u060c \u0627\u0644\u0642\u0627\u0647\u0631\u0629\u060c \u0645\u0635\u0631",
  footerMobile: "+2 0100 607 1661",
  footerWhatsapp: "+2 0100 607 1661",
}

export function hexToRgb(hex: string) {
  const normalized = (hex || "#000000").replace("#", "")
  const bigint = Number.parseInt(normalized.length === 3 ? normalized.split("").map((char) => `${char}${char}`).join("") : normalized, 16)

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

export function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function platformFontStack(fontFamily: string) {
  const stacks: Record<string, string> = {
    Montserrat: '"Montserrat", "Segoe UI", Tahoma, Arial, sans-serif',
    Rubik: '"Rubik", "Segoe UI", Tahoma, Arial, sans-serif',
    Poppins: '"Poppins", "Segoe UI", Tahoma, Arial, sans-serif',
    Cairo: '"Cairo", "Segoe UI", Tahoma, Arial, sans-serif',
    Tahoma: 'Tahoma, "Segoe UI", Arial, sans-serif',
    Arial: 'Arial, "Segoe UI", Tahoma, sans-serif',
  }

  return stacks[fontFamily] || stacks.Rubik
}

export function cleanPlatformThemeAssets(theme: PlatformThemeSettings): PlatformThemeSettings {
  return {
    ...theme,
    logoEnUrl: /^blob:/i.test(theme.logoEnUrl) ? defaultPlatformTheme.logoEnUrl : theme.logoEnUrl,
    logoArUrl: /^blob:/i.test(theme.logoArUrl) ? defaultPlatformTheme.logoArUrl : theme.logoArUrl,
    faviconUrl: /^blob:/i.test(theme.faviconUrl) ? defaultPlatformTheme.faviconUrl : theme.faviconUrl,
  }
}

export function normalizePlatformTheme(theme?: Partial<PlatformThemeSettings> | null): PlatformThemeSettings {
  return cleanPlatformThemeAssets({ ...defaultPlatformTheme, ...(theme || {}) })
}

function hasThemePayload(theme?: Partial<PlatformThemeSettings> | null) {
  return Boolean(theme && Object.keys(theme).length)
}

function hasCustomAsset(value?: string | null, defaultValue?: string) {
  const normalized = value?.trim()
  return Boolean(normalized && normalized !== defaultValue && !/^blob:/i.test(normalized))
}

export function resolvePlatformTheme(
  remote?: Partial<PlatformThemeSettings> | null,
  current: PlatformThemeSettings = defaultPlatformTheme,
) {
  if (!hasThemePayload(remote)) return current

  const next = normalizePlatformTheme(remote)
  const currentHasCustomLogo =
    hasCustomAsset(current.logoEnUrl, defaultPlatformTheme.logoEnUrl) ||
    hasCustomAsset(current.logoArUrl, defaultPlatformTheme.logoArUrl) ||
    hasCustomAsset(current.faviconUrl, defaultPlatformTheme.faviconUrl)
  const remoteHasCustomLogo =
    hasCustomAsset(next.logoEnUrl, defaultPlatformTheme.logoEnUrl) ||
    hasCustomAsset(next.logoArUrl, defaultPlatformTheme.logoArUrl) ||
    hasCustomAsset(next.faviconUrl, defaultPlatformTheme.faviconUrl)

  if (currentHasCustomLogo && !remoteHasCustomLogo) {
    return {
      ...next,
      logoEnUrl: current.logoEnUrl,
      logoArUrl: current.logoArUrl,
      faviconUrl: current.faviconUrl,
    }
  }

  return next
}

export function readSavedPlatformTheme() {
  if (typeof window === "undefined") return defaultPlatformTheme

  try {
    const saved = window.localStorage.getItem(platformThemeStorageKey)
    return saved ? normalizePlatformTheme(JSON.parse(saved)) : defaultPlatformTheme
  } catch {
    return defaultPlatformTheme
  }
}

export function savePlatformTheme(theme: PlatformThemeSettings) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(platformThemeStorageKey, JSON.stringify(normalizePlatformTheme(theme)))
}

export function applyPlatformTheme(theme: PlatformThemeSettings) {
  if (typeof document === "undefined") return

  const normalized = normalizePlatformTheme(theme)
  const root = document.documentElement
  const primaryHsl = rgbToHsl(hexToRgb(normalized.primaryColor))
  const secondaryHsl = rgbToHsl(hexToRgb(normalized.secondaryColor))
  const accentHsl = rgbToHsl(hexToRgb(normalized.accentColor))

  root.style.setProperty("--primary", primaryHsl)
  root.style.setProperty("--secondary", secondaryHsl)
  root.style.setProperty("--brand-blue", primaryHsl)
  root.style.setProperty("--brand-purple", accentHsl)
  root.style.setProperty("--admin-primary", normalized.primaryColor)
  root.style.setProperty("--admin-secondary", normalized.secondaryColor)
  root.style.setProperty("--admin-accent", normalized.accentColor)
  root.style.setProperty("--admin-primary-hsl", primaryHsl)
  root.style.setProperty("--radius", `${Number(normalized.radius) / 16}rem`)
  
  const currentLang = document.documentElement.lang || "ar"
  const fontToUse = currentLang === "ar" ? normalized.fontFamilyAr : normalized.fontFamily
  root.style.setProperty("--platform-font", platformFontStack(fontToUse))
  
  root.dataset.platformButton = normalized.buttonStyle
  root.dataset.platformDensity = normalized.density

  updateFavicon(normalized.faviconUrl)
}

function cacheableAssetUrl(value: string) {
  const url = apiAssetUrl(value) || defaultPlatformTheme.faviconUrl
  if (/^data:/i.test(url)) return url

  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}v=${Date.now()}`
}

function ensureIconLink(rel: string) {
  const selector = `link[rel="${rel}"]`
  let link = document.head.querySelector<HTMLLinkElement>(selector)
  if (!link) {
    link = document.createElement("link")
    link.rel = rel
    document.head.appendChild(link)
  }
  return link
}

export function updateFavicon(value: string) {
  if (typeof document === "undefined") return

  const href = cacheableAssetUrl(value)
  const icon = ensureIconLink("icon")
  icon.type = /\.svg(\?|$)/i.test(href) ? "image/svg+xml" : "image/png"
  icon.href = href

  const shortcut = ensureIconLink("shortcut icon")
  shortcut.href = href

  const apple = ensureIconLink("apple-touch-icon")
  apple.href = href
}
