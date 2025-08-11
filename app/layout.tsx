import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { LanguageProvider } from "@/components/language-provider"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Nabou - Professional Barber Management",
  description: "Complete appointment management system for modern barbershops",
  generator: "v0.dev",
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/logo.jpg" type="image/jpeg" />
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
          <div id="root">{children}</div>
          <ToastProvider>
            <ToastViewport />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
