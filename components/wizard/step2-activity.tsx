"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scissors, Sparkles, Hand, Eye, Palette, Heart, Flower2, Zap, User, Crown } from "lucide-react"

interface Step2ActivityProps {
  onNext: (activity: string) => void
  onBack: () => void
}

const ACTIVITIES = [
  {
    id: "barber",
    name: "Barber",
    description: "Men's haircuts, beard trims, and traditional grooming",
    icon: Scissors,
    color: "bg-blue-500",
    popular: true,
  },
  {
    id: "hairstylist",
    name: "Hair Stylist",
    description: "Hair cutting, coloring, styling for all genders",
    icon: Sparkles,
    color: "bg-purple-500",
    popular: true,
  },
  {
    id: "nail_artist",
    name: "Nail Artist",
    description: "Manicures, pedicures, nail art and extensions",
    icon: Hand,
    color: "bg-pink-500",
    popular: true,
  },
  {
    id: "esthetician",
    name: "Esthetician",
    description: "Facials, skincare treatments, and skin analysis",
    icon: Sparkles,
    color: "bg-green-500",
    popular: true,
  },
  {
    id: "brow_specialist",
    name: "Brow Specialist",
    description: "Eyebrow shaping, threading, tinting, and microblading",
    icon: Eye,
    color: "bg-amber-500",
    popular: false,
  },
  {
    id: "makeup_artist",
    name: "Makeup Artist",
    description: "Professional makeup application for events and photos",
    icon: Palette,
    color: "bg-rose-500",
    popular: false,
  },
  {
    id: "lash_technician",
    name: "Lash Technician",
    description: "Eyelash extensions, lifts, and tinting services",
    icon: Eye,
    color: "bg-indigo-500",
    popular: false,
  },
  {
    id: "massage_therapist",
    name: "Massage Therapist",
    description: "Therapeutic and relaxation massage treatments",
    icon: Heart,
    color: "bg-teal-500",
    popular: false,
  },
  {
    id: "tattoo_artist",
    name: "Tattoo Artist",
    description: "Custom tattoo design and application",
    icon: Zap,
    color: "bg-red-500",
    popular: false,
  },
  {
    id: "permanent_makeup",
    name: "Permanent Makeup Artist",
    description: "Microblading, lip blush, and permanent cosmetics",
    icon: Crown,
    color: "bg-violet-500",
    popular: false,
  },
  {
    id: "wellness_coach",
    name: "Wellness Coach",
    description: "Health coaching, nutrition guidance, and lifestyle consulting",
    icon: Flower2,
    color: "bg-emerald-500",
    popular: false,
  },
  {
    id: "other",
    name: "Other",
    description: "Different type of beauty or wellness service",
    icon: User,
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
      <div className="text-center">
        <User className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">What's your main activity?</h2>
        <p className="text-muted-foreground">
          Select your primary area of expertise to get personalized service recommendations.
        </p>
      </div>

      {/* Popular Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Popular Activities
          </CardTitle>
          <CardDescription>Most common service providers on our platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularActivities.map((activity) => {
              const IconComponent = activity.icon
              const isSelected = selectedActivity === activity.id

              return (
                <div
                  key={activity.id}
                  className={`
                    relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"}
                  `}
                  onClick={() => handleActivitySelect(activity.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${activity.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{activity.name}</h3>
                        {activity.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Other Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Other Activities</CardTitle>
          <CardDescription>Additional specialized services and treatments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherActivities.map((activity) => {
              const IconComponent = activity.icon
              const isSelected = selectedActivity === activity.id

              return (
                <div
                  key={activity.id}
                  className={`
                    relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"}
                  `}
                  onClick={() => handleActivitySelect(activity.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${activity.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{activity.name}</h3>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!selectedActivity}>
          Continue to Services
          {!selectedActivity && <span className="ml-2 text-xs">(Select an activity)</span>}
        </Button>
      </div>
    </div>
  )
}
