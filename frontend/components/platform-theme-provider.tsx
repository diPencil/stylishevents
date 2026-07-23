"use client"

import { useEffect } from "react"
import { platformApi } from "@/lib/platform-api"
import {
  applyPlatformTheme,
  normalizePlatformTheme,
  readSavedPlatformTheme,
  resolvePlatformTheme,
  savePlatformTheme,
} from "@/lib/platform-theme"

export function PlatformThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyPlatformTheme(readSavedPlatformTheme())

    platformApi.getThemeSettings()
      .then((remote) => {
        const theme = resolvePlatformTheme(remote, readSavedPlatformTheme())
        savePlatformTheme(theme)
        applyPlatformTheme(theme)
      })
      .catch(() => {})

    const syncTheme = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : null
      const theme = detail ? normalizePlatformTheme(detail) : readSavedPlatformTheme()
      applyPlatformTheme(theme)
    }

    window.addEventListener("stylish-events-theme-settings-updated", syncTheme)
    return () => window.removeEventListener("stylish-events-theme-settings-updated", syncTheme)
  }, [])

  return children
}
