"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { LanguageSelector } from "@/components/language-selector"

export function LoginForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [errorCode, setErrorCode] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check for auto-login credentials from registration
    const autoLoginData = sessionStorage.getItem("autoLogin")
    if (autoLoginData) {
      try {
        const credentials = JSON.parse(autoLoginData)
        setEmail(credentials.email)
        setPassword(credentials.password)

        // Clear the stored credentials
        sessionStorage.removeItem("autoLogin")

        // Auto-submit the form after a brief delay
        setTimeout(() => {
          const form = document.querySelector("form")
          if (form) {
            form.requestSubmit()
          }
        }, 500)
      } catch (error) {
        console.error("Error parsing auto-login data:", error)
        sessionStorage.removeItem("autoLogin")
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setErrorCode("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorCode(data.code || "")
        throw new Error(data.error || "Login failed")
      }

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/barber")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const getErrorIcon = () => {
    if (errorCode === "TRIAL_EXPIRED" || errorCode === "ACCESS_RESTRICTED") {
      return <AlertTriangle className="h-4 w-4" />
    }
    return null
  }

  const getErrorVariant = () => {
    if (errorCode === "TRIAL_EXPIRED") {
      return "default" // Use default styling for trial expiration
    }
    return "destructive"
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t.auth.signIn}</CardTitle>
          <LanguageSelector />
        </div>
        <p className="text-slate-600 mt-2">{t.auth.signInToAccount}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert
              variant={getErrorVariant()}
              className={errorCode === "TRIAL_EXPIRED" ? "border-orange-200 bg-orange-50 text-orange-800" : ""}
            >
              {getErrorIcon()}
              <AlertDescription className="flex items-center gap-2">
                {error}
                {errorCode === "TRIAL_EXPIRED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 h-6 text-xs border-orange-300 text-orange-700 hover:bg-orange-100 bg-transparent"
                    onClick={() => {
                      // This could redirect to a pricing/upgrade page
                      window.open("mailto:support@barbershop.com?subject=Upgrade Request", "_blank")
                    }}
                  >
                    Contact Support
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t.auth.enterEmail}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t.auth.enterPassword}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.auth.signIn}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <p>{t.auth.demoCredentials}</p>
          <p>
            <strong>{t.auth.admin}:</strong> admin@barbershop.com / admin123
          </p>
          <p>
            <strong>{t.auth.barber}:</strong> john@barbershop.com / barber123
          </p>
          {errorCode === "TRIAL_EXPIRED" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                <strong>Trial Information:</strong> Free accounts are limited to 20 appointments. Contact support to
                upgrade your account for unlimited access.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
