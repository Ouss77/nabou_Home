"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  getTranslation,
  getStoredLanguage,
  setStoredLanguage,
  detectBrowserLanguage,
  type Translation,
} from "@/lib/i18n"

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>("en")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const stored = getStoredLanguage()
    const detected = detectBrowserLanguage()
    const initialLang = stored || detected
    setLanguageState(initialLang)
  }, [])

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    setStoredLanguage(lang)
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang
    }
  }

  const t = getTranslation(language)

  if (!isClient) {
    // Return default English translations during SSR
    return (
      <LanguageContext.Provider value={{ language: "en", setLanguage: () => {}, t: getTranslation("en") }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Return safe defaults if used outside provider
    return {
      language: "en",
      setLanguage: () => {},
      t: getTranslation("en"),
    }
  }
  return context
}
