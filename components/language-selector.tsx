"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/components/language-provider"
import { type Language, languages } from "@/lib/i18n"
import { Globe, Check, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentLang = languages.find((l) => l.code === language)

  const toggleDropdown = () => setIsOpen((open) => !open)

  const handleSelect = (code: Language) => {
    setLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="relative z-999 inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center gap-2 px-2 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select Language"
        type="button"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-5 text-blue-500" />
          <span className="hidden sm:inline font-medium text-sm">
            {currentLang?.flag} {currentLang?.name}
          </span>
          <span className="sm:hidden text-lg">{currentLang?.flag}</span>
        </div>
        <ChevronDown
          className={`ml-1 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu"
          >
            {languages.map(({ code, name, flag }) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors duration-150 ${
                  language === code
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
                role="menuitem"
                type="button"
              >
                <span className="text-xl">{flag}</span>
                <span className="flex-grow font-medium">{name}</span>
                {language === code && (
                  <Check className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
