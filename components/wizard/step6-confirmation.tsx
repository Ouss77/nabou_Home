"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Clock, Camera } from "lucide-react"
import type { StoreType } from "@/lib/db"

interface Step6ConfirmationProps {
  store: StoreType
  onComplete: () => void
}

export function Step6Confirmation({ store, onComplete }: Step6ConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-green-700">Congratulations!</h2>
        <p className="text-muted-foreground text-lg">
          Your store has been successfully set up and is ready to accept appointments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Store Details
          </CardTitle>
          <CardDescription>Here's a summary of what you've created.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">{store.title}</h3>
            <p className="text-muted-foreground">{store.address}</p>
            {store.description && <p className="text-sm text-muted-foreground mt-2">{store.description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">Store ID: {store.id}</Badge>
            <Badge variant="outline">Slug: {store.slug}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">Services Added</h3>
            <p className="text-sm text-muted-foreground">Your services are ready for booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">Hours Configured</h3>
            <p className="text-sm text-muted-foreground">Working hours have been set</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium mb-1">Images Uploaded</h3>
            <p className="text-sm text-muted-foreground">Your store looks great!</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-700">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium">Start Managing Appointments</h4>
              <p className="text-sm text-muted-foreground">View and manage customer bookings from your dashboard</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium">Share Your Booking Link</h4>
              <p className="text-sm text-muted-foreground">
                Customers can book directly at: <code className="bg-white px-1 rounded">/book/{store.slug}</code>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium">Customize Your Profile</h4>
              <p className="text-sm text-muted-foreground">
                Add more services, update hours, or upload additional images anytime
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-4">
        <Button onClick={onComplete} size="lg" className="px-8">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
