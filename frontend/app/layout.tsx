import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { PlatformThemeProvider } from "@/components/platform-theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { Toaster } from "@/components/ui/sonner"

const baseMetadata: Metadata = {
  metadataBase: new URL("https://stylish-events.com"),
  title: {
    default: "Stylish Events | تنظيم المؤتمرات والمعارض والفعاليات",
    template: "%s | Stylish Events",
  },
  description:
    "Stylish Events تقدم حلول تنظيم وإدارة الفعاليات والمؤتمرات والمعارض، مع التسجيل الإلكتروني، التذاكر، الحضور، الشهادات، والتقارير.",
  keywords: [
    "تنظيم مؤتمرات",
    "تنظيم معارض",
    "فعاليات كبرى",
    "Stylish Events",
    "Event Management",
    "Conference Organizing Egypt",
    "International Exhibitions",
    "Event Booking",
    "Event Operations",
  ],
  alternates: {
    canonical: "https://stylish-events.com",
  },
  authors: [{ name: "Stylish Events Team" }],
  creator: "Stylish Events",
  publisher: "Stylish Events",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://stylish-events.com",
    siteName: "Stylish Events",
    title: "Stylish Events | شريكك في نجاح الفعاليات",
    description: "حلول احترافية لتنظيم وإدارة المؤتمرات والمعارض والفعاليات بمعايير تشغيل واضحة وتجربة حضور متكاملة.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stylish Events Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stylish Events",
    description: "تنظيم وإدارة المؤتمرات والمعارض والفعاليات باحترافية.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": 0,
      "max-image-preview": "large",
      "max-snippet": 0,
    },
  },
  // Icons are generated dynamically via `generateMetadata()` to support
  // a runtime-updated favicon stored in project settings (uploads/assets/...)
}

async function fetchPublicThemeSettings() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
    const res = await fetch(`${API_BASE}/api/platform/settings/theme`, { cache: "no-store" })
    const payload = await res.json().catch(() => ({}))
    return payload?.data || null
  } catch {
    return null
  }
}

function resolveAssetUrl(value?: string | null) {
  if (!value) return ""
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  const v = String(value)
  if (/^data:/i.test(v) || /^https?:\/\//i.test(v)) return v
  if (v.startsWith("/uploads/")) return `${API_BASE}${v}`
  if (v.startsWith("uploads/")) return `${API_BASE}/${v}`
  if (v.startsWith("/")) return v
  return `/${v}`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicThemeSettings()
  const faviconUrl = resolveAssetUrl(settings?.faviconUrl)

  return {
    ...baseMetadata,
    title: settings?.projectName || baseMetadata.title,
    icons: {
      icon: faviconUrl || "/favicon.png",
      shortcut: faviconUrl || "/favicon.png",
      apple: faviconUrl || "/favicon.png",
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedLang = localStorage.getItem('language');
                  var browserLanguages = [navigator.language].concat(navigator.languages || []);
                  var isArabicDevice = browserLanguages.some(function(locale) {
                    return locale && locale.toLowerCase().indexOf('ar') === 0;
                  });
                  var lang = savedLang === 'ar' || savedLang === 'en' ? savedLang : (isArabicDevice ? 'ar' : 'en');
                  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
                  document.documentElement.lang = lang;
                  var savedTheme = localStorage.getItem('stylish-events-theme-settings');
                  var theme = savedTheme ? JSON.parse(savedTheme) : {};
                  var hexToHsl = function(hex) {
                      hex = (hex || '#000000').replace('#', '');
                      if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
                      var num = parseInt(hex, 16);
                      var r = ((num >> 16) & 255) / 255;
                      var g = ((num >> 8) & 255) / 255;
                      var b = (num & 255) / 255;
                      var max = Math.max(r, g, b), min = Math.min(r, g, b);
                      var h = 0, s = 0, l = (max + min) / 2;
                      if (max !== min) {
                        var d = max - min;
                        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
                        else if (max === g) h = (b - r) / d + 2;
                        else h = (r - g) / d + 4;
                        h /= 6;
                      }
                      return Math.round(h * 360) + ' ' + Math.round(s * 100) + '% ' + Math.round(l * 100) + '%';
                    };
                    var root = document.documentElement;
                    var primaryHex = theme.primaryColor || '#EA580C';
                    var secondaryHex = theme.secondaryColor || '#0f172a';
                    var accentHex = theme.accentColor || '#2563EB';
                    var primary = hexToHsl(primaryHex);
                    var secondary = hexToHsl(secondaryHex);
                    var accent = hexToHsl(accentHex);
                    root.style.setProperty('--primary', primary);
                    root.style.setProperty('--secondary', secondary);
                    root.style.setProperty('--brand-blue', primary);
                    root.style.setProperty('--brand-purple', accent);
                    root.style.setProperty('--admin-primary', primaryHex);
                    root.style.setProperty('--admin-secondary', secondaryHex);
                    root.style.setProperty('--admin-accent', accentHex);
                    root.style.setProperty('--login-primary', primaryHex);
                    root.style.setProperty('--login-secondary', secondaryHex);
                    root.style.setProperty('--login-accent', accentHex);
                    root.style.setProperty('--signup-primary', primaryHex);
                    root.style.setProperty('--signup-secondary', secondaryHex);
                    root.style.setProperty('--signup-accent', accentHex);
                    root.style.setProperty('--forgot-primary', primaryHex);
                    root.style.setProperty('--forgot-secondary', secondaryHex);
                    root.style.setProperty('--forgot-accent', accentHex);
                    root.style.setProperty('--radius', (Number(theme.radius || 12) / 16) + 'rem');
                    var fontAr = theme.fontFamilyAr || 'Cairo';
                    var fontEn = theme.fontFamily || 'Rubik';
                    var fontToUse = lang === 'ar' ? fontAr : fontEn;
                    var platformFontStack = function(f) {
                      var stacks = {
                        Montserrat: '"Montserrat", "Segoe UI", Tahoma, Arial, sans-serif',
                        Rubik: '"Rubik", "Segoe UI", Tahoma, Arial, sans-serif',
                        Poppins: '"Poppins", "Segoe UI", Tahoma, Arial, sans-serif',
                        Cairo: '"Cairo", "Segoe UI", Tahoma, Arial, sans-serif',
                        Tahoma: 'Tahoma, "Segoe UI", Arial, sans-serif',
                        Arial: 'Arial, "Segoe UI", Tahoma, sans-serif'
                      };
                      return stacks[f] || stacks.Rubik;
                    };
                    root.style.setProperty('--platform-font', platformFontStack(fontToUse));
                    root.dataset.platformButton = theme.buttonStyle || 'solid';
                    root.dataset.platformDensity = theme.density || 'comfortable';
                    if (theme.faviconUrl) {
                      var apiBase = '${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}';
                      var faviconUrl = String(theme.faviconUrl || '/stylish-favicon.svg');
                      if (faviconUrl.indexOf('/uploads/') === 0) faviconUrl = apiBase + faviconUrl;
                      if (faviconUrl.indexOf('uploads/') === 0) faviconUrl = apiBase + '/' + faviconUrl;
                      if (faviconUrl.indexOf('data:') !== 0) faviconUrl += (faviconUrl.indexOf('?') === -1 ? '?' : '&') + 'v=' + Date.now();
                      var ensureIcon = function(rel) {
                        var link = document.head.querySelector('link[rel="' + rel + '"]');
                        if (!link) {
                          link = document.createElement('link');
                          link.rel = rel;
                          document.head.appendChild(link);
                        }
                        link.href = faviconUrl;
                        if (rel === 'icon') link.type = faviconUrl.indexOf('.svg') !== -1 ? 'image/svg+xml' : 'image/png';
                      };
                      ensureIcon('icon');
                      ensureIcon('shortcut icon');
                      ensureIcon('apple-touch-icon');
                    }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="white"
            enableSystem
            value={{ light: "white", dark: "black" }}
          >
            <PlatformThemeProvider>{children}</PlatformThemeProvider>
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
