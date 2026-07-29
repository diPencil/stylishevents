import type { GetServerSideProps } from "next"
import { normalizeSiteContentSettings } from "@/lib/site-content-defaults"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stylish-events.com"

type SitemapRoute = {
  path: string
  changefreq: "daily" | "weekly" | "monthly"
  priority: string
}

const baseRoutes: SitemapRoute[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/upcoming-events/", changefreq: "daily", priority: "0.8" },
  { path: "/previous-events/", changefreq: "weekly", priority: "0.7" },
  { path: "/about/", changefreq: "monthly", priority: "0.8" },
  { path: "/contact/", changefreq: "monthly", priority: "0.8" },
]

async function getLegalVisibility() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/platform/settings/site-content`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    if (!response.ok) throw new Error("site content unavailable")
    const payload = await response.json()
    const settings = normalizeSiteContentSettings(payload?.data || {})
    return {
      terms: settings.legalPages.terms.enabled !== false,
      privacy: settings.legalPages.privacy.enabled !== false,
    }
  } catch {
    return { terms: true, privacy: true }
  }
}

function absoluteUrl(path: string) {
  const base = SITE_BASE_URL.replace(/\/+$/, "")
  return `${base}${path}`
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const legal = await getLegalVisibility()
  const routes = [...baseRoutes]

  if (legal.terms) routes.push({ path: "/terms/", changefreq: "monthly", priority: "0.5" })
  if (legal.privacy) routes.push({ path: "/privacy/", changefreq: "monthly", priority: "0.5" })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(absoluteUrl(route.path))}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`

  res.setHeader("Content-Type", "application/xml; charset=utf-8")
  res.setHeader("Cache-Control", "no-store, max-age=0")
  res.write(xml)
  res.end()

  return { props: {} }
}

export default function SitemapXml() {
  return null
}
