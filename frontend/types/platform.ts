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
  footerLocationEn: string
  footerLocationAr: string
  footerMobile: string
  footerWhatsapp: string
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

export type HomepageTimelineItem = {
  id: string
  labelEn: string
  labelAr: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
}

export type HomepageGalleryImage = {
  id: string
  imageUrl: string
  altEn: string
  altAr: string
  focalPosition: "center" | "top" | "bottom" | "left" | "right"
}

export type HomepageInspireSectionSettings = {
  enabled: boolean
  eyebrowEn: string
  eyebrowAr: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  showAccentLine: boolean
  anchorId?: string
  timeline: {
    enabled: boolean
    items: HomepageTimelineItem[]
  }
  cta: {
    enabled: boolean
    labelEn: string
    labelAr: string
    url: string
    linkType: "internal" | "external"
    openInNewTab: boolean
  }
  gallery: HomepageGalleryImage[]
}

export type FeaturesSectionHeaderSettings = {
  enabled: boolean
  eyebrowEn: string
  eyebrowAr: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
}

export type HomepageRequestSetupStatCard = {
  id: string
  value: string
  labelEn: string
  labelAr: string
}

export type HomepageRequestSetupSettings = {
  enabled: boolean
  eyebrowEn: string
  eyebrowAr: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  supportingTextEn: string
  supportingTextAr: string
  statCards: HomepageRequestSetupStatCard[]
  stepsEn: [string, string, string]
  stepsAr: [string, string, string]
  nextLabelEn: string
  nextLabelAr: string
  backLabelEn: string
  backLabelAr: string
  submitLabelEn: string
  submitLabelAr: string
  sendingLabelEn: string
  sendingLabelAr: string
  successTitleEn: string
  successTitleAr: string
  successDescriptionEn: string
  successDescriptionAr: string
}

export type HomepageFinalCtaSettings = {
  enabled: boolean
  eyebrowEn: string
  eyebrowAr: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  primaryButtonEnabled: boolean
  primaryButtonLabelEn: string
  primaryButtonLabelAr: string
  primaryButtonUrl: string
  primaryButtonOpenInNewTab: boolean
}

export type ContactCardIcon = "phone" | "mail" | "mapPin" | "headphones"

export type ContactCardLinkType = "phone" | "email" | "internal" | "external" | "map" | "whatsapp"

export type ContactInformationCardSettings = {
  id: string
  enabled: boolean
  icon: ContactCardIcon
  labelEn: string
  labelAr: string
  value: string
  supportingTextEn: string
  supportingTextAr: string
  linkType: ContactCardLinkType
  linkValue: string
}

export type ContactBenefitCardSettings = {
  id: string
  icon: "message" | "userCheck" | "calendar" | "lifeBuoy"
  titleEn: string
  titleAr: string
  textEn: string
  textAr: string
}

export type ContactInquiryTypeOption = {
  id: string
  value: string
  enabled: boolean
  labelEn: string
  labelAr: string
  order: number
}

export type ContactPageSettings = {
  hero: {
    enabled: boolean
    eyebrowEn: string
    eyebrowAr: string
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
    supportingTextEn: string
    supportingTextAr: string
    imageUrl: string
    imageAltEn: string
    imageAltAr: string
    primaryCtaEn: string
    primaryCtaAr: string
    secondaryCtaEn: string
    secondaryCtaAr: string
  }
  contactCards: ContactInformationCardSettings[]
  requestSection: {
    enabled: boolean
    eyebrowEn: string
    eyebrowAr: string
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
    supportingTextEn: string
    supportingTextAr: string
    benefits: ContactBenefitCardSettings[]
    submitLabelEn: string
    submitLabelAr: string
    clearLabelEn: string
    clearLabelAr: string
    sendingLabelEn: string
    sendingLabelAr: string
    errorTitleEn: string
    errorTitleAr: string
    consentLabelEn: string
    consentLabelAr: string
    inquiryTypes: ContactInquiryTypeOption[]
    fieldLabels: {
      fullNameEn: string
      fullNameAr: string
      emailEn: string
      emailAr: string
      phoneEn: string
      phoneAr: string
      companyEn: string
      companyAr: string
      inquiryTypeEn: string
      inquiryTypeAr: string
      preferredContactEn: string
      preferredContactAr: string
      subjectEn: string
      subjectAr: string
      messageEn: string
      messageAr: string
      eventDateEn: string
      eventDateAr: string
      eventCityEn: string
      eventCityAr: string
      expectedAttendeesEn: string
      expectedAttendeesAr: string
    }
    placeholders: {
      fullNameEn: string
      fullNameAr: string
      emailEn: string
      emailAr: string
      phoneEn: string
      phoneAr: string
      companyEn: string
      companyAr: string
      subjectEn: string
      subjectAr: string
      messageEn: string
      messageAr: string
      eventCityEn: string
      eventCityAr: string
      expectedAttendeesEn: string
      expectedAttendeesAr: string
    }
  }
  successState: {
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
  }
}

export type AboutCapabilityIcon = "calendar" | "ticket" | "qrCode" | "mail" | "barChart" | "users"

export type AboutValuePoint = {
  id: string
  textEn: string
  textAr: string
}

export type AboutImageItem = {
  id: string
  imageUrl: string
  altEn: string
  altAr: string
}

export type AboutCapabilityCard = {
  id: string
  enabled: boolean
  icon: AboutCapabilityIcon
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
}

export type AboutPrincipleItem = {
  id: string
  textEn: string
  textAr: string
}

export type AboutTeamMember = {
  id: string
  enabled: boolean
  imageUrl: string
  imageAltEn: string
  imageAltAr: string
  nameEn: string
  nameAr: string
  jobTitleEn: string
  jobTitleAr: string
  bioEn: string
  bioAr: string
  linkedinUrl: string
  email: string
}

export type AboutPageSettings = {
  hero: {
    enabled: boolean
    eyebrowEn: string
    eyebrowAr: string
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
    supportingTextEn: string
    supportingTextAr: string
    imageUrl: string
    imageAltEn: string
    imageAltAr: string
    breadcrumbEn: string
    breadcrumbAr: string
  }
  overview: {
    enabled: boolean
    eyebrowEn: string
    eyebrowAr: string
    headingEn: string
    headingAr: string
    descriptionEn: string
    descriptionAr: string
    valuePoints: AboutValuePoint[]
    images: AboutImageItem[]
    ctaEnabled: boolean
    ctaLabelEn: string
    ctaLabelAr: string
    ctaUrl: string
  }
  ecosystem: {
    enabled: boolean
    eyebrowEn: string
    eyebrowAr: string
    headingEn: string
    headingAr: string
    descriptionEn: string
    descriptionAr: string
    cards: AboutCapabilityCard[]
  }
  team: {
    enabled: boolean
    eyebrowEn: string
    eyebrowAr: string
    headingEn: string
    headingAr: string
    descriptionEn: string
    descriptionAr: string
    members: AboutTeamMember[]
  }
  vision: {
    enabled: boolean
    eyebrowEn: string
    eyebrowAr: string
    headingEn: string
    headingAr: string
    descriptionEn: string
    descriptionAr: string
    principles: AboutPrincipleItem[]
    imageUrl: string
    imageAltEn: string
    imageAltAr: string
    ctaEnabled: boolean
    ctaLabelEn: string
    ctaLabelAr: string
    ctaUrl: string
  }
}

export type LegalPageFocalPosition = "center" | "top" | "bottom" | "left" | "right"

export type LegalContentSection = {
  id: string
  enabled: boolean
  anchor: string
  titleEn: string
  titleAr: string
  contentEn: string
  contentAr: string
}

export type LegalPageSettings = {
  enabled: boolean
  hero: {
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
    imageUrl: string
    imageAltEn: string
    imageAltAr: string
    focalPosition: LegalPageFocalPosition
  }
  lastUpdated: string
  lastUpdatedLabelEn: string
  lastUpdatedLabelAr: string
  sections: LegalContentSection[]
  contact: {
    email: string
    phone: string
    addressEn: string
    addressAr: string
  }
  seo: {
    titleEn: string
    titleAr: string
    descriptionEn: string
    descriptionAr: string
    canonicalPath: string
    ogImage: string
    robotsIndex: boolean
    robotsFollow: boolean
  }
}

export type LegalPagesSettings = {
  terms: LegalPageSettings
  privacy: LegalPageSettings
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
