"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarberRegistrationDialog } from "@/components/barber-registration-dialog"

export default function RegisterPage() {
  const router = useRouter()
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="container mx-auto max-w-md">
        <BarberRegistrationDialog isOpen={showRegistrationDialog} onClose={() => router.push("/")} />
      </div>
    </div>
  )
}
