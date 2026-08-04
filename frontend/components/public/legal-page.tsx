"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { platformApi } from "@/lib/platform-api"
import { normalizeLegalPagesSettings } from "@/lib/legal-pages-defaults"
import { PublicPageFrame, PublicPageHero } from "@/components/public/page-building-blocks"
import type { LegalContentSection, LegalPageSettings } from "@/types/platform"

type LegalPageKey = "terms" | "privacy"

export function LegalPage({ pageKey, defaults }: { pageKey: LegalPageKey; defaults: LegalPageSettings }) {
  const { isRtl } = useLanguage()
  const [settings, setSettings] = useState<LegalPageSettings>(defaults)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    platformApi
      .getSiteContentSettings()
      .then((data) => {
        if (!alive) return
        setSettings(normalizeLegalPagesSettings(data?.legalPages)[pageKey])
      })
      .catch(() => {
        if (!alive) return
        setSettings(defaults)
      })
      .finally(() => {
        if (alive) setLoaded(true)
      })

    return () => {
      alive = false
    }
  }, [defaults, pageKey])

  if (loaded && settings.enabled === false) {
    notFound()
  }

  const sections = useMemo(
    () => settings.sections.filter((section) => section.enabled !== false && (section.titleEn || section.titleAr || section.contentEn || section.contentAr)),
    [settings.sections],
  )

  const title = isRtl ? settings.hero.titleAr : settings.hero.titleEn
  const description = isRtl ? settings.hero.descriptionAr : settings.hero.descriptionEn
  const lastUpdatedLabel = isRtl ? settings.lastUpdatedLabelAr : settings.lastUpdatedLabelEn

  return (
    <PublicPageFrame>
      <PublicPageHero
        title={title}
        description={description}
        backgroundImage={settings.hero.imageUrl}
        backgroundPosition={settings.hero.focalPosition}
        imageAlt={isRtl ? settings.hero.imageAltAr : settings.hero.imageAltEn}
      />

      <section className="px-4 py-12 sm:px-6 lg:py-16" dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[28px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">{lastUpdatedLabel}</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{settings.lastUpdated}</p>
                </div>
              </div>

              <nav className="mt-5 space-y-2" aria-label={isRtl ? "أقسام الصفحة" : "Page sections"}>
                {sections.map((section, index) => (
                  <Link
                    key={section.id}
                    href={`#${section.anchor}`}
                    className="block rounded-2xl px-4 py-3 text-sm font-extrabold text-slate-500 transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <span className="text-primary">{String(index + 1).padStart(2, "0")}</span>
                    <span className="mx-2">{isRtl ? section.titleAr : section.titleEn}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <article className="rounded-[32px] bg-white p-5 shadow-[0_22px_70px_rgba(15,23,42,0.07)] md:p-9 lg:p-12">
            <div className="space-y-10">
              {sections.map((section, index) => (
                <LegalSectionBlock key={section.id} section={section} index={index} isRtl={isRtl} />
              ))}
            </div>

            <div className="mt-12 rounded-[28px] bg-slate-50 p-6">
              <h2 className="text-2xl font-black text-slate-950">{isRtl ? "بيانات التواصل" : "Contact Information"}</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <ContactLink icon={Mail} label={settings.contact.email} href={`mailto:${settings.contact.email}`} />
                <ContactLink icon={Phone} label={settings.contact.phone} href={`tel:${settings.contact.phone.replace(/\s+/g, "")}`} />
                <ContactLink icon={MapPin} label={isRtl ? settings.contact.addressAr : settings.contact.addressEn} />
              </div>
            </div>
          </article>
        </div>
      </section>
    </PublicPageFrame>
  )
}

function LegalSectionBlock({ section, index, isRtl }: { section: LegalContentSection; index: number; isRtl: boolean }) {
  return (
    <section id={section.anchor} className="scroll-mt-28 border-b border-slate-100 pb-10 last:border-b-0 last:pb-0">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{String(index + 1).padStart(2, "0")}</p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-4xl lg:text-5xl">{isRtl ? section.titleAr : section.titleEn}</h2>
      <div className="mt-5 space-y-4 text-base font-medium leading-8 text-slate-600">
        <LegalRichText text={isRtl ? section.contentAr : section.contentEn} />
      </div>
    </section>
  )
}

function ContactLink({ icon: Icon, label, href }: { icon: typeof Mail; label: string; href?: string }) {
  const content = (
    <span className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-slate-600 shadow-sm">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <span className="break-words">{label}</span>
    </span>
  )

  return href ? <a href={href}>{content}</a> : content
}

function LegalRichText({ text }: { text: string }) {
  const blocks = useMemo(() => parseBlocks(text), [text])
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return <h3 key={index} className="pt-2 text-xl font-black text-slate-900">{renderInline(block.lines[0])}</h3>
        }
        if (block.type === "ul") {
          return (
            <ul key={index} className="space-y-2">
              {block.lines.map((line, itemIndex) => (
                <li key={itemIndex} className="flex gap-3">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{renderInline(line)}</span>
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === "ol") {
          return (
            <ol key={index} className="list-decimal space-y-2 ps-6">
              {block.lines.map((line, itemIndex) => (
                <li key={itemIndex}>{renderInline(line)}</li>
              ))}
            </ol>
          )
        }
        return <p key={index}>{renderInline(block.lines.join(" "))}</p>
      })}
    </>
  )
}

function parseBlocks(text: string) {
  const blocks: Array<{ type: "p" | "heading" | "ul" | "ol"; lines: string[] }> = []
  const lines = String(text || "").split(/\r?\n/)
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", lines: paragraph })
      paragraph = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      continue
    }
    if (line.startsWith("### ")) {
      flushParagraph()
      blocks.push({ type: "heading", lines: [line.slice(4).trim()] })
      continue
    }
    if (line.startsWith("- ")) {
      flushParagraph()
      const previous = blocks[blocks.length - 1]
      if (previous?.type === "ul") previous.lines.push(line.slice(2).trim())
      else blocks.push({ type: "ul", lines: [line.slice(2).trim()] })
      continue
    }
    if (/^\d+\.\s+/.test(line)) {
      flushParagraph()
      const previous = blocks[blocks.length - 1]
      const value = line.replace(/^\d+\.\s+/, "")
      if (previous?.type === "ol") previous.lines.push(value)
      else blocks.push({ type: "ol", lines: [value] })
      continue
    }
    paragraph.push(line)
  }

  flushParagraph()
  return blocks
}

function renderInline(text: string) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-black text-slate-800">{part.slice(2, -2)}</strong>
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      const href = safeHref(linkMatch[2])
      if (!href) return <span key={index}>{linkMatch[1]}</span>
      return (
        <a key={index} href={href} className="font-extrabold text-primary underline-offset-4 hover:underline">
          {linkMatch[1]}
        </a>
      )
    }
    return <span key={index}>{part}</span>
  })
}

function safeHref(value: string) {
  const href = value.trim()
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href
  if (href.startsWith("/") || href.startsWith("#")) return href
  return ""
}
