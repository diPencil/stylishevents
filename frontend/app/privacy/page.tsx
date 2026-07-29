import type { Metadata } from "next"
import { LegalPage } from "@/components/public/legal-page"
import { DEFAULT_PRIVACY_PAGE_SETTINGS } from "@/lib/site-content-defaults"

export const metadata: Metadata = {
  title: DEFAULT_PRIVACY_PAGE_SETTINGS.seo.titleEn,
  description: DEFAULT_PRIVACY_PAGE_SETTINGS.seo.descriptionEn,
  alternates: { canonical: DEFAULT_PRIVACY_PAGE_SETTINGS.seo.canonicalPath },
  openGraph: {
    title: DEFAULT_PRIVACY_PAGE_SETTINGS.seo.titleEn,
    description: DEFAULT_PRIVACY_PAGE_SETTINGS.seo.descriptionEn,
    images: [DEFAULT_PRIVACY_PAGE_SETTINGS.seo.ogImage],
  },
  robots: {
    index: DEFAULT_PRIVACY_PAGE_SETTINGS.seo.robotsIndex,
    follow: DEFAULT_PRIVACY_PAGE_SETTINGS.seo.robotsFollow,
  },
}

export default function PrivacyPage() {
  return <LegalPage pageKey="privacy" defaults={DEFAULT_PRIVACY_PAGE_SETTINGS} />
}
