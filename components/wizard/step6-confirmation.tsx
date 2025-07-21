"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Calendar, Settings, ImageIcon } from "lucide-react"
import type { Store } from "@/lib/db"

interface Step6ConfirmationProps {
  store: Store
  onComplete: () => void
}

export function Step6Confirmation({ store, onComplete }: Step6ConfirmationProps) {
  const profileUrl = `/profile/${store.slug}`
  const dashboardUrl = "/barber"

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">🎉 Congratulations!</h2>
        <p className="text-muted-foreground text-lg">
          Your store has been successfully set up and is ready to accept bookings.
        </p>
      </div>

      {/* Store Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{store.title}</CardTitle>
          <CardDescription>{store.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{store.description}</p>
          <div className="mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ✅ Store Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>Here are some things you can do to get started:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Start Accepting Bookings</h4>
              <p className="text-sm text-muted-foreground">
                Your booking page is live and customers can start scheduling appointments.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Customize Your Settings</h4>
              <p className="text-sm text-muted-foreground">
                Fine-tune your services, working hours, and booking preferences.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ImageIcon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Add More Photos</h4>
              <p className="text-sm text-muted-foreground">
                Upload more images to showcase your work and attract customers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-between bg-transparent" asChild>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              View Your Public Profile
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          <Button variant="outline" className="w-full justify-between bg-transparent" asChild>
            <a href={dashboardUrl}>
              Go to Dashboard
              <Settings className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Complete Button */}
      <div className="text-center pt-4">
        <Button onClick={onComplete} size="lg" className="px-8">
          Complete Setup & Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
