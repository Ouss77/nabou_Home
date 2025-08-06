"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    const autoLoginData = sessionStorage.getItem("autoLogin")
    if (autoLoginData) {
      try {
        const credentials = JSON.parse(autoLoginData)
        setEmail(credentials.email)
        setPassword(credentials.password)
        sessionStorage.removeItem("autoLogin")
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
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), // Convert to lowercase and remove whitespace
          password 
        }),
            })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

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
    <Card className="border-0 text-purple-900 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="✉️  Email address"
              className="placeholder:text-slate-500"
            />
          </div>

          <div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="🔒  Password"
              className="placeholder:text-slate-500"
            />
          </div>

          <Button type="submit" className="w-full bg-purple-900" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
