"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { type Language, getStoredLanguage, setStoredLanguage, getTranslation, type Translations } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isLoading, setIsLoading] = useState(true)

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        const storedLang = getStoredLanguage()
        console.log("Initializing language:", storedLang)
        setLanguageState(storedLang)

        // Set document language for accessibility
        if (typeof document !== "undefined") {
          document.documentElement.lang = storedLang
        }
      } catch (error) {
        console.error("Failed to initialize language:", error)
        setLanguageState("en")
      } finally {
        setIsLoading(false)
      }
    }

    initializeLanguage()
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    console.log("Changing language to:", lang)
    setLanguageState(lang)
    setStoredLanguage(lang)

    // Set document language for accessibility
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang
    }
  }, [])

  const t = getTranslation(language)

  // Show loading state to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Provide fallback values instead of throwing error
    console.warn("useLanguage used outside LanguageProvider, using fallback")
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: getTranslation("en"),
      isLoading: false,
    }
  }
  return context
}
