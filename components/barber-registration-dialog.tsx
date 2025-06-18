"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Mail, Phone, MapPin, Lock, Check, Copy, ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useRouter } from "next/navigation"

interface BarberRegistrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BarberRegistrationDialog({ open, onOpenChange }: BarberRegistrationDialogProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [step, setStep] = useState<"form" | "success">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
  })
  const [registeredCredentials, setRegisteredCredentials] = useState<{
    email: string
    password: string
  } | null>(null)

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format"
    if (formData.password.length < 6) return "Password must be at least 6 characters"
    if (formData.password !== formData.confirmPassword) return "Passwords don't match"
    if (!formData.phone.trim()) return "Phone number is required"
    if (!formData.city.trim()) return "City is required"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName, // Changed from 'name' to 'fullName'
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword, // Added confirmPassword
          phone: formData.phone,
          city: formData.city,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setRegisteredCredentials({
        email: formData.email,
        password: formData.password,
      })
      setStep("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCredentials = async () => {
    if (registeredCredentials) {
      const credentials = `Email: ${registeredCredentials.email}\nPassword: ${registeredCredentials.password}`
      try {
        await navigator.clipboard.writeText(credentials)
        // You could add a toast notification here
      } catch (err) {
        console.error("Failed to copy credentials:", err)
      }
    }
  }

  const handleContinueToLogin = () => {
    if (registeredCredentials) {
      // Store credentials temporarily for auto-login
      sessionStorage.setItem("autoLogin", JSON.stringify(registeredCredentials))
      onOpenChange(false)
      router.push("/login")
    }
  }

  const resetForm = () => {
    setStep("form")
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      city: "",
    })
    setRegisteredCredentials(null)
    setError("")
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  if (step === "success") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">{t.registration.success}</DialogTitle>
            <DialogDescription className="text-center">{t.registration.successMessage}</DialogDescription>
          </DialogHeader>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                {t.registration.loginCredentials}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-sm text-gray-600">Email:</div>
                <div className="font-mono text-sm">{registeredCredentials?.email}</div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="text-sm text-gray-600">Password:</div>
                <div className="font-mono text-sm">{registeredCredentials?.password}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyCredentials} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  {t.registration.copyCredentials}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleContinueToLogin} className="w-full" size="lg">
            {t.registration.continueToLogin}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.registration.title}</DialogTitle>
          <DialogDescription>{t.registration.subtitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">{t.registration.fullName}</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.registration.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t.registration.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.registration.confirmPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t.registration.phone}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t.registration.city}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="city"
                  type="text"
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <div className="font-medium">{t.registration.passwordRequirements}</div>
            <div className="flex items-center gap-2">
              <Check className={`h-3 w-3 ${formData.password.length >= 6 ? "text-green-500" : "text-gray-300"}`} />
              <span>{t.registration.passwordMinLength}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check
                className={`h-3 w-3 ${
                  formData.password && formData.password === formData.confirmPassword
                    ? "text-green-500"
                    : "text-gray-300"
                }`}
              />
              <span>
                {formData.password && formData.password === formData.confirmPassword
                  ? t.registration.passwordsMatch
                  : t.registration.passwordsDontMatch}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.registration.register}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
