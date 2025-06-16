import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/components/language-provider"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "BarberBook - Professional Barber Management",
  description: "Complete appointment management system for modern barbershops",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('barberbook-language');
                if (stored && ['en', 'fr'].includes(stored)) {
                  document.documentElement.lang = stored;
                }
              } catch (e) {
                console.warn('Failed to set initial language');
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <ToastProvider>
            <ToastViewport />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
