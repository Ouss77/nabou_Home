"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, LogIn, User, Mail, Phone, MapPin, Check } from "lucide-react"

interface RegistrationSuccessTicketProps {
  userData: {
    name: string
    email: string
    phone: string
    city: string
  }
  credentials: {
    email: string
    password: string
  }
  onProceedToLogin: () => void
}

export function RegistrationSuccessTicket({ userData, credentials, onProceedToLogin }: RegistrationSuccessTicketProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Account Created Successfully!</h2>
        <p className="text-slate-600">Welcome to BarberBook! Your account is ready to use.</p>
      </div>

      {/* Account Details Ticket */}
      <Card className="border-2 border-green-200 shadow-lg mb-6">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-green-800">Account Details</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
              Barber Account
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* User Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">Name:</span>
              <span className="font-medium text-slate-800">{userData.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">Email:</span>
              <span className="font-medium text-slate-800">{userData.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">Phone:</span>
              <span className="font-medium text-slate-800">{userData.phone}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">City:</span>
              <span className="font-medium text-slate-800">{userData.city}</span>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-800 mb-3">Login Credentials</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                  <p className="font-mono text-sm text-slate-800">{credentials.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.email, "email")}
                  className="h-8 w-8 p-0"
                >
                  {copiedField === "email" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Password</p>
                  <p className="font-mono text-sm text-slate-800">{"•".repeat(credentials.password.length)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.password, "password")}
                  className="h-8 w-8 p-0"
                >
                  {copiedField === "password" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button
        onClick={onProceedToLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
        size="lg"
      >
        <LogIn className="mr-2 h-5 w-5" />
        Continue to Login
      </Button>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">What's Next?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Set up your barbershop profile</li>
          <li>• Add your services and pricing</li>
          <li>• Configure your working hours</li>
          <li>• Start accepting appointments!</li>
        </ul>
      </div>
    </div>
  )
}
