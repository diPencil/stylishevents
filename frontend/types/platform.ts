export type PlatformThemeSettings = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  radius: string
  fontFamily: string
  fontFamilyAr: string
  buttonStyle: "solid" | "soft" | "outline"
  density: "comfortable" | "compact"
  logoEnUrl: string
  logoArUrl: string
  faviconUrl: string
}

export type EventPageSortMode = 'default' | 'nearest' | 'latest' | 'oldest'

export type EventPageSettings = {
  enabled: boolean
  eyebrowEn: string
  eyebrowAr: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  emptyTitleEn: string
  emptyTitleAr: string
  emptyDescriptionEn: string
  emptyDescriptionAr: string
  sortMode: EventPageSortMode
  itemsPerPage?: number
}

export type EventInformationBullet = {
  id: string
  textEn: string
  textAr: string
}

export type EventInformationSectionSettings = {
  enabled: boolean
  badgeEn: string
  badgeAr: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  imageUrl: string
  imageAltEn: string
  imageAltAr: string
  imagePosition: 'left' | 'right'
  bullets: EventInformationBullet[]
}

// augment EventPageSettings with optional informationSection
export type EventPageSettingsWithInfo = EventPageSettings & {
  informationSection?: EventInformationSectionSettings
}

export type AdminOverviewStats = {
  events: number
  publishedEvents: number
  orders: number
  attendees: number
  checkedIn: number
  revenue: number
  pendingReviews: number
}

export type AdminOverview = {
  stats: AdminOverviewStats
  upcomingEvents: Array<{
    id: number
    slug: string
    title_en: string
    title_ar: string
    status: string
    starts_at: string
    ends_at: string
    max_attendees: number | null
  }>
}
