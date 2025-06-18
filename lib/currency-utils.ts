import type { Language } from "@/lib/i18n"

export function formatCurrency(amount: number, language: Language = "en"): string {
  const locale = language === "fr" ? "fr-FR" : "en-US"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and parse as float
  const cleaned = value.replace(/[€$,\s]/g, "")
  return Number.parseFloat(cleaned) || 0
}

export function getCurrencySymbol(language: Language = "en"): string {
  return "€"
}
