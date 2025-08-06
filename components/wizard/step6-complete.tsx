"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Globe, Calendar, Settings, ExternalLink, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Store {
  id: string
  title: string
  slug?: string
}

interface Step6CompleteProps {
  store: Store
  onComplete: () => void
}

export function Step6Complete({ store, onComplete }: Step6CompleteProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="h-20 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          🎉 Congratulations!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Your store is now live and ready to accept bookings!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          You can always update these settings later from your dashboard.
        </p>
      </div>

      <Card className="border-2 border-transparent bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <CardHeader className="bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg text-center">
          <CardTitle className="text-2xl text-purple-700 dark:text-purple-300 mb-2">
            {store.title}
          </CardTitle>
          <CardDescription className="text-purple-600 dark:text-purple-400">
            Your business is now online! Here's what you can do next:
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-purple-200 dark:border-purple-700 rounded-lg bg-white/50 dark:bg-gray-900/50">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Share Your Booking Link</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your customers can now book appointments online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-purple-200 dark:border-purple-700 rounded-lg bg-white/50 dark:bg-gray-900/50">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Manage Your Calendar</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and manage all your appointments in one place
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-purple-200 dark:border-purple-700 rounded-lg bg-white/50 dark:bg-gray-900/50">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Customize Your Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add more photos, update services, and personalize your page
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href={`/profile/${store.slug || store.id}`} target="_blank">
                <Globe className="mr-2 h-4 w-4" />
                View My Profile
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Link href={`/book/${store.slug || store.id}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Booking Page
              </Link>
            </Button>
          </div>

          <Button
            onClick={onComplete}
            className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}