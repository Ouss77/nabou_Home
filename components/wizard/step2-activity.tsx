"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scissors, Sparkles, Hand, Eye, Palette, Heart, Zap, Brush, Flower2, Plus, ArrowLeft } from "lucide-react"

interface Step2ActivityProps {
  onNext: (activity: string) => void
  onBack: () => void
}

const ACTIVITIES = [
  {
    id: "barber",
    name: "Barber",
    description: "Men's haircuts, beard trims, and traditional barbering services",
    icon: Scissors,
    color: "bg-blue-500",
    popular: true,
  },
  {
    id: "hair-stylist",
    name: "Hair Stylist",
    description: "Hair cutting, coloring, styling, and treatments for all genders",
    icon: Sparkles,
    color: "bg-purple-500",
    popular: true,
  },
  {
    id: "nail-artist",
    name: "Nail Artist",
    description: "Manicures, pedicures, nail art, and nail enhancements",
    icon: Hand,
    color: "bg-pink-500",
    popular: true,
  },
  {
    id: "esthetician",
    name: "Esthetician",
    description: "Facial treatments, skincare, and beauty therapy services",
    icon: Sparkles,
    color: "bg-green-500",
    popular: true,
  },
  {
    id: "brow-specialist",
    name: "Brow Specialist",
    description: "Eyebrow shaping, threading, microblading, and brow treatments",
    icon: Eye,
    color: "bg-amber-500",
    popular: false,
  },
  {
    id: "makeup-artist",
    name: "Makeup Artist",
    description: "Professional makeup application for events, weddings, and photoshoots",
    icon: Palette,
    color: "bg-rose-500",
    popular: false,
  },
  {
    id: "lash-technician",
    name: "Lash Technician",
    description: "Eyelash extensions, lifts, tints, and lash enhancement services",
    icon: Eye,
    color: "bg-indigo-500",
    popular: false,
  },
  {
    id: "massage-therapist",
    name: "Massage Therapist",
    description: "Therapeutic massage, relaxation, and wellness treatments",
    icon: Heart,
    color: "bg-teal-500",
    popular: false,
  },
  {
    id: "tattoo-artist",
    name: "Tattoo Artist",
    description: "Custom tattoos, tattoo design, and body art services",
    icon: Zap,
    color: "bg-red-500",
    popular: false,
  },
  {
    id: "permanent-makeup",
    name: "Permanent Makeup Artist",
    description: "Microblading, lip blush, eyeliner tattoo, and cosmetic tattooing",
    icon: Brush,
    color: "bg-orange-500",
    popular: false,
  },
  {
    id: "wellness-coach",
    name: "Wellness Coach",
    description: "Health coaching, nutrition guidance, and lifestyle consulting",
    icon: Flower2,
    color: "bg-emerald-500",
    popular: false,
  },
  {
    id: "other",
    name: "Other",
    description: "Custom services or specialized treatments not listed above",
    icon: Plus,
    color: "bg-gray-500",
    popular: false,
  },
]

export function Step2Activity({ onNext, onBack }: Step2ActivityProps) {
  const [selectedActivity, setSelectedActivity] = useState<string>("")

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId)
  }

  const handleContinue = () => {
    if (selectedActivity) {
      onNext(selectedActivity)
    }
  }

  const popularActivities = ACTIVITIES.filter((activity) => activity.popular)
  const otherActivities = ACTIVITIES.filter((activity) => !activity.popular)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What's Your Main Activity?</h2>
        <p className="text-muted-foreground">
          Select your primary area of expertise to get personalized service recommendations
        </p>
      </div>

      {/* Popular Activities */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Popular Activities</h3>
          <Badge variant="secondary">Most Common</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularActivities.map((activity) => {
            const IconComponent = activity.icon
            return (
              <Card
                key={activity.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedActivity === activity.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                }`}
                onClick={() => handleActivitySelect(activity.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activity.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{activity.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Other Activities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Other Specialties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherActivities.map((activity) => {
            const IconComponent = activity.icon
            return (
              <Card
                key={activity.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedActivity === activity.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                }`}
                onClick={() => handleActivitySelect(activity.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${activity.color} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{activity.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!selectedActivity} className="min-w-[120px]">
          Continue
        </Button>
      </div>
    </div>
  )
}
