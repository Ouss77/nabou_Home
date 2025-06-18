import type { Language } from "@/lib/i18n"

export function formatCurrency(amount: number, language: Language = "en"): string {
  // Format for Euros
  const formatter = new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}

export function formatPrice(price: number, language: Language = "en"): string {
  return formatCurrency(price, language)
}

// Simple Euro symbol formatting for backward compatibility
export function formatEuro(price: number): string {
  return `€${price.toFixed(2)}`
}
