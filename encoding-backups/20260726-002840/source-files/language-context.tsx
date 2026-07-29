"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { translations } from "../lib/translations"

type Language = "ar" | "en"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
    isRtl: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function isLanguage(value: string | null | undefined): value is Language {
    return value === "ar" || value === "en"
}

function applyDocumentLanguage(lang: Language) {
    if (typeof document === "undefined") return
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = lang
}

function getInitialLanguage(): Language {
    if (typeof window === "undefined") return "ar"

    const savedLang = window.localStorage.getItem("language")
    if (isLanguage(savedLang)) return savedLang

    const htmlLang = document.documentElement.lang
    if (isLanguage(htmlLang)) return htmlLang

    const browserLanguages = [window.navigator.language, ...(window.navigator.languages || [])]
    const hasArabicLocale = browserLanguages.some((locale) => locale?.toLowerCase().startsWith("ar"))

    return hasArabicLocale ? "ar" : "en"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("ar")
    const hydratedRef = useRef(false)

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem("language", lang)
        applyDocumentLanguage(lang)
    }

    useEffect(() => {
        if (!hydratedRef.current) {
            hydratedRef.current = true
            const initialLanguage = getInitialLanguage()
            if (initialLanguage !== language) {
                setLanguage(initialLanguage)
                applyDocumentLanguage(initialLanguage)
                localStorage.setItem("language", initialLanguage)
                document.getElementById("language-hydration-guard")?.remove()
                return
            }
        }

        applyDocumentLanguage(language)
        localStorage.setItem("language", language)
        document.getElementById("language-hydration-guard")?.remove()
    }, [language])

    const t = (key: string) => {
        const keys = key.split(".")
        let result: any = translations[language]

        for (const k of keys) {
            if (result && result[k]) {
                result = result[k]
            } else {
                return key // Return key if translation not found
            }
        }

        return result
    }

    const isRtl = language === "ar"

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isRtl }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
