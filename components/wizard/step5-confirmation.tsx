"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ExternalLink, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"
import type { Store } from "@/lib/db"

interface Step5ConfirmationProps {
  store: Store
  onClose: () => void
}

export function Step5Confirmation({ store, onClose }: Step5ConfirmationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const myConfetti = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      })
      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [])

  return (
    <div className="relative flex h-full flex-col items-center justify-center text-center">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />
      <Card className="relative z-10 max-w-md p-6">
        <CardHeader className="items-center">
          <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
          <CardTitle className="text-2xl">Congratulations!</CardTitle>
          <CardDescription>Your website has been created successfully!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium">{store.title}</p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/barber" onClick={onClose}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/book/${store.slug || store.id}`} target="_blank" onClick={onClose}>
                <ExternalLink className="mr-2 h-4 w-4" /> Preview Your Store
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
