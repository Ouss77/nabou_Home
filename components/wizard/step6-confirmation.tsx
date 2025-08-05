"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  ExternalLink,
  Calendar,
  Settings,
  ImageIcon
} from "lucide-react"
import { motion } from "framer-motion"
import type { Store } from "@/lib/db"
import { useEffect, useLayoutEffect } from "react"

interface Step6ConfirmationProps {
  store: Store
  onComplete: () => void
}

export function Step6Confirmation({ store, onComplete }: Step6ConfirmationProps) {
  const profileUrl = `/profile/${store.slug}`
  const dashboardUrl = "/barber"


  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header with Confetti & Glow */}
      <div className="text-center relative">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto animate-pulse drop-shadow-lg" />
        </motion.div>
        <h2 className="text-3xl font-bold mt-24 mb-2 animate-fade-in">
          🎉 Congratulations!
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          You've just created your own <strong>online store</strong> — your new digital presence
          is live! It's time to <span className="text-primary font-medium">stand out and attract more customers</span>.
        </p>
      </div>

      {/* Store Summary */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>{store.title}</CardTitle>
          <CardDescription>{store.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{store.description}</p>
          <div className="mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ✅ Store Active & Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Next Steps to Shine ✨</CardTitle>
          <CardDescription>
            Boost your visibility by completing these actions:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            {
              icon: Calendar,
              title: "Start Accepting Bookings",
              text: "Your booking page is live and ready to take appointments."
            },
            {
              icon: Settings,
              title: "Customize Your Settings",
              text: "Update your services, hours, and preferences."
            },
            {
              icon: ImageIcon,
              title: "Add Photos",
              text: "Upload pictures of your work to build trust and attract more clients."
            }
          ].map(({ icon: Icon, title, text }) => (
            <motion.div
              key={title}
              className="flex items-start gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <Icon className="h-5 w-5 text-primary mt-1 animate-fade-in" />
              <div>
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access 🔗</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-between bg-transparent hover:bg-muted" asChild>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              View Your Website
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          <Button variant="outline" className="w-full justify-between bg-transparent hover:bg-muted" asChild>
            <a href={dashboardUrl}>
              Go to Dashboard
              <Settings className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <div className="text-center pt-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Button
            onClick={onComplete}
            size="lg"
            className="px-8 shadow-md bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:brightness-110 transition-all"
          >
            🚀 Launch Dashboard
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
