"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/components/language-provider"
import { type Language, languages } from "@/lib/i18n"
import { Globe, Check, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

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

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  const currentLang = languages.find((l) => l.code === language)

  const toggleDropdown = () => setIsOpen((open) => !open)

  const handleSelect = (code: Language) => {
    setLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} style={{ zIndex: 9999 }}>
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select Language"
        type="button"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className=" sm:inline font-medium text-sm  flex items-center gap-2">
            <Image
              src={currentLang?.flag || ''}
              alt={`${currentLang?.name} flag`}
              width={20}
              height={15}
              className="rounded-sm"
            />
            {/* {currentLang?.name} */}
          </span>
          <span className="sm:hidden flex">
            <Image
              src={currentLang?.flag || ''}
              alt={`${currentLang?.name} flag`}
              width={20}
              height={15}
              className="rounded-sm"
            />
          </span>
        </div>
        <ChevronDown
          className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm"
              style={{ zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-40 rounded-xl bg-white/95 backdrop-blur-md dark:bg-gray-800/95 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
              style={{ zIndex: 9999 }}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="language-menu"
            >
              {languages.map(({ code, name, flag }) => (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-all duration-150 ${
                    language === code
                      ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                      : "hover:bg-gray-50/80 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                  }`}
                  role="menuitem"
                  type="button"
                >
                  <Image
                    src={flag}
                    alt={`${name} flag`}
                    width={20}
                    height={15}
                    className="rounded-sm"
                  />
                  <span className="flex-grow">{name}</span>
                  {language === code && <Check className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
