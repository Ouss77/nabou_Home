"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PartyPopper } from "lucide-react"
import Link from "next/link"
import type { Store } from "@/lib/db"
import Confetti from "react-confetti"
import { useWindowSize } from "@uidotdev/usehooks"

interface Step5ConfirmationProps {
  store: Store
  onClose: () => void
}

export function Step5Confirmation({ store, onClose }: Step5ConfirmationProps) {
  const { width, height } = useWindowSize()

  return (
    <>
      {width && height && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Card className="w-full max-w-md p-8">
          <CardContent className="flex flex-col items-center justify-center gap-6">
            <div className="rounded-full bg-green-100 p-4">
              <PartyPopper className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Congratulations!</h2>
              <p className="text-muted-foreground">Your store has been created successfully!</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button onClick={onClose} className="w-full">
                Go to Dashboard
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href={`/book/${store.slug}`} target="_blank">
                  Preview Your Store
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
