"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ExternalLink, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Store } from "@/lib/db"

interface Step5ConfirmationProps {
  store: Store
  onComplete: () => void
}

export function Step5Confirmation({ store, onComplete }: Step5ConfirmationProps) {
  const { toast } = useToast()

  const publicUrl = `${window.location.origin}/book/${store.slug || store.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast({
        title: "Link Copied!",
        description: "Your booking page link has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please copy it manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
        <p className="text-lg text-muted-foreground">Your barbershop is now ready to accept appointments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Store is Live!</CardTitle>
          <CardDescription>
            {store.title} has been successfully created and is now available for bookings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Share your booking page with customers</li>
              <li>• Start receiving and managing appointments</li>
              <li>• Customize your services and hours anytime</li>
              <li>• Upload more photos to attract customers</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Your Booking Page:</h4>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm">{publicUrl}</code>
              <Button size="sm" variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-4">
        <Button onClick={onComplete} size="lg" className="w-full md:w-auto">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
