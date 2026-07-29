import type { Metadata } from "next"
import { LegalPage } from "@/components/public/legal-page"
import { DEFAULT_TERMS_PAGE_SETTINGS } from "@/lib/site-content-defaults"

export const metadata: Metadata = {
  title: DEFAULT_TERMS_PAGE_SETTINGS.seo.titleEn,
  description: DEFAULT_TERMS_PAGE_SETTINGS.seo.descriptionEn,
  alternates: { canonical: DEFAULT_TERMS_PAGE_SETTINGS.seo.canonicalPath },
  openGraph: {
    title: DEFAULT_TERMS_PAGE_SETTINGS.seo.titleEn,
    description: DEFAULT_TERMS_PAGE_SETTINGS.seo.descriptionEn,
    images: [DEFAULT_TERMS_PAGE_SETTINGS.seo.ogImage],
  },
  robots: {
    index: DEFAULT_TERMS_PAGE_SETTINGS.seo.robotsIndex,
    follow: DEFAULT_TERMS_PAGE_SETTINGS.seo.robotsFollow,
  },
}

export default function TermsPage() {
  return <LegalPage pageKey="terms" defaults={DEFAULT_TERMS_PAGE_SETTINGS} />
}
