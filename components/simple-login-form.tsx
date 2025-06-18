"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function SimpleLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
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

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <p className="text-slate-600 mt-2">Sign in to your account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

     {/*   <div className="mt-6 text-center text-sm text-slate-600">
          <p>Demo Credentials:</p>
          <p>
            <strong>Admin:</strong> admin@barbershop.com / admin123
          </p>
          <p>
            <strong>Barber:</strong> john@barbershop.com / barber123
          </p>
        </div>*/}
      </CardContent>
    </Card>
  )
}
