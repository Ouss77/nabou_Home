"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Camera, Wrench } from "lucide-react"
import type { StoreType } from "@/lib/db"

interface Step6ConfirmationProps {
  store: StoreType
  onComplete: () => void
}

export function Step6Confirmation({ store, onComplete }: Step6ConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-900">Setup Complete!</h2>
          <p className="text-muted-foreground">Congratulations! Your store is now ready to accept appointments.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {store.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Store Information</div>
                <div className="text-sm text-muted-foreground">Basic details configured</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Activity Selected</div>
                <div className="text-sm text-muted-foreground">Services customized</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Services Added</div>
                <div className="text-sm text-muted-foreground">Ready for bookings</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Working Hours</div>
                <div className="text-sm text-muted-foreground">Schedule configured</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-3">What's Next?</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Start accepting appointments from customers</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span>Add more photos to showcase your work</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span>Customize your services and pricing anytime</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-6">
        <Button onClick={onComplete} size="lg" className="min-w-[200px]">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
