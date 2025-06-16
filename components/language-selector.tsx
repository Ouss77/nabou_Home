"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/components/language-provider"
import { type Language, languages } from "@/lib/i18n" // Import languages from i18n.ts
import { Globe, Check } from "lucide-react"

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
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select Language"
        type="button"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline font-medium text-sm">
          {currentLang?.flag} {currentLang?.name}
        </span>
        <span className="sm:hidden text-lg">{currentLang?.flag}</span>
        <svg
          className={`ml-1 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu"
        >
          {languages.map(({ code, name, flag }) => (
            <button
              key={code}
              onClick={() => handleSelect(code)}
              className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left ${
                language === code ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
              } focus:bg-blue-100 focus:outline-none`}
              role="menuitem"
              type="button"
            >
              <span className="text-xl">{flag}</span>
              <span className="flex-grow">{name}</span>
              {language === code && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
