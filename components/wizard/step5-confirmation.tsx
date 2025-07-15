"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import type { Store } from "@/lib/db" // Import Store type

interface Step5ConfirmationProps {
  store: Store
  onClose: () => void
}

export function Step5Confirmation({ store, onClose }: Step5ConfirmationProps) {
  const router = useRouter()
  const { width, height } = useWindowSize()

  const handleGoToDashboard = () => {
    onClose()
    router.push("/barber")
  }

  const handlePreviewStore = () => {
    onClose()
    router.push(`/book/${store.slug}`)
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Congratulations!</CardTitle>
          <CardDescription>Your website has been created successfully!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGoToDashboard} className="w-full">
            Go to Dashboard
          </Button>
          <Button onClick={handlePreviewStore} variant="outline" className="w-full bg-transparent">
            Preview Your Store
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
