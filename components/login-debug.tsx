"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      setDebugInfo({
        status: response.status,
        ok: response.ok,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const checkUser = async (email: string) => {
    try {
      const response = await fetch(`/api/debug/user?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      setDebugInfo({
        userCheck: true,
        status: response.status,
        data: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setDebugInfo({
        userCheck: true,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Login Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => testLogin("admin@barbershop.com", "admin123")} disabled={loading}>
            Test Admin Login
          </Button>
          <Button onClick={() => testLogin("john@barbershop.com", "barber123")} disabled={loading}>
            Test Barber Login
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => checkUser("admin@barbershop.com")} disabled={loading} variant="outline">
            Check Admin User
          </Button>
          <Button onClick={() => checkUser("john@barbershop.com")} disabled={loading} variant="outline">
            Check Barber User
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
