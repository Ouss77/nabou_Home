"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Trash2, ArrowLeft, Sparkles, Check } from "lucide-react"

interface Step3ServicesProps {
  storeId: string
  selectedActivity: string
  onNext: () => void
  onBack: () => void
}

interface Service {
  id?: string
  name: string
  description: string
  price: number
  duration_minutes: number
  isRecommended?: boolean
}

// Activity-specific service recommendations
const SERVICE_RECOMMENDATIONS: Record<string, Service[]> = {
  barber: [
    {
      name: "Classic Haircut",
      description: "Traditional men's haircut with styling",
      price: 25,
      duration_minutes: 30,
      isRecommended: true,
    },
    {
      name: "Beard Trim",
      description: "Professional beard shaping and trimming",
      price: 15,
      duration_minutes: 20,
      isRecommended: true,
    },
    {
      name: "Hot Towel Shave",
      description: "Traditional straight razor shave with hot towel",
      price: 30,
      duration_minutes: 45,
      isRecommended: true,
    },
    {
      name: "Fade Cut",
      description: "Modern fade haircut with precision styling",
      price: 28,
      duration_minutes: 35,
      isRecommended: true,
    },
    {
      name: "Mustache Trim",
      description: "Precise mustache grooming and styling",
      price: 8,
      duration_minutes: 10,
      isRecommended: true,
    },
    {
      name: "Hair Wash & Style",
      description: "Professional hair washing and styling",
      price: 12,
      duration_minutes: 15,
      isRecommended: true,
    },
  ],
  "hair-stylist": [
    {
      name: "Women's Cut & Style",
      description: "Professional haircut with blow-dry and styling",
      price: 45,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Hair Color",
      description: "Full hair coloring service with professional products",
      price: 80,
      duration_minutes: 120,
      isRecommended: true,
    },
    {
      name: "Highlights",
      description: "Partial or full highlights with toning",
      price: 90,
      duration_minutes: 150,
      isRecommended: true,
    },
    {
      name: "Blowout",
      description: "Professional blow-dry and styling",
      price: 25,
      duration_minutes: 30,
      isRecommended: true,
    },
    {
      name: "Hair Treatment",
      description: "Deep conditioning and repair treatment",
      price: 35,
      duration_minutes: 45,
      isRecommended: true,
    },
    {
      name: "Updo Styling",
      description: "Special occasion updo and formal styling",
      price: 50,
      duration_minutes: 60,
      isRecommended: true,
    },
  ],
  "nail-artist": [
    {
      name: "Classic Manicure",
      description: "Traditional manicure with polish",
      price: 20,
      duration_minutes: 45,
      isRecommended: true,
    },
    {
      name: "Gel Manicure",
      description: "Long-lasting gel polish manicure",
      price: 30,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Classic Pedicure",
      description: "Relaxing pedicure with foot care",
      price: 25,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Gel Pedicure",
      description: "Gel polish pedicure with extended wear",
      price: 35,
      duration_minutes: 75,
      isRecommended: true,
    },
    {
      name: "Nail Art",
      description: "Custom nail art and decorative designs",
      price: 15,
      duration_minutes: 30,
      isRecommended: true,
    },
    {
      name: "Nail Extensions",
      description: "Acrylic or gel nail extensions",
      price: 40,
      duration_minutes: 90,
      isRecommended: true,
    },
  ],
  esthetician: [
    {
      name: "Classic Facial",
      description: "Deep cleansing facial with extractions",
      price: 60,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Anti-Aging Facial",
      description: "Advanced anti-aging treatment with serums",
      price: 80,
      duration_minutes: 75,
      isRecommended: true,
    },
    {
      name: "Acne Treatment",
      description: "Specialized acne-fighting facial treatment",
      price: 70,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Chemical Peel",
      description: "Professional chemical exfoliation treatment",
      price: 90,
      duration_minutes: 45,
      isRecommended: true,
    },
    {
      name: "Microdermabrasion",
      description: "Diamond-tip skin resurfacing treatment",
      price: 75,
      duration_minutes: 50,
      isRecommended: true,
    },
    {
      name: "Hydrating Facial",
      description: "Intensive moisture and hydration treatment",
      price: 65,
      duration_minutes: 60,
      isRecommended: true,
    },
  ],
  "brow-specialist": [
    {
      name: "Eyebrow Threading",
      description: "Precise eyebrow shaping with threading",
      price: 15,
      duration_minutes: 20,
      isRecommended: true,
    },
    {
      name: "Eyebrow Waxing",
      description: "Professional eyebrow waxing and shaping",
      price: 12,
      duration_minutes: 15,
      isRecommended: true,
    },
    {
      name: "Brow Tinting",
      description: "Eyebrow tinting for enhanced definition",
      price: 18,
      duration_minutes: 25,
      isRecommended: true,
    },
    {
      name: "Brow Lamination",
      description: "Eyebrow lamination for fuller, styled brows",
      price: 35,
      duration_minutes: 45,
      isRecommended: true,
    },
    {
      name: "Microblading",
      description: "Semi-permanent eyebrow tattooing",
      price: 250,
      duration_minutes: 120,
      isRecommended: true,
    },
    {
      name: "Brow Mapping",
      description: "Professional brow shape consultation and mapping",
      price: 20,
      duration_minutes: 30,
      isRecommended: true,
    },
  ],
  "makeup-artist": [
    {
      name: "Event Makeup",
      description: "Professional makeup for special events",
      price: 60,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Bridal Makeup",
      description: "Wedding day makeup with trial session",
      price: 120,
      duration_minutes: 90,
      isRecommended: true,
    },
    {
      name: "Photoshoot Makeup",
      description: "Professional makeup for photography",
      price: 80,
      duration_minutes: 75,
      isRecommended: true,
    },
    {
      name: "Everyday Makeup",
      description: "Natural, everyday makeup application",
      price: 40,
      duration_minutes: 45,
      isRecommended: true,
    },
    {
      name: "Makeup Lesson",
      description: "Personal makeup tutorial and training",
      price: 70,
      duration_minutes: 90,
      isRecommended: true,
    },
    {
      name: "Special Effects Makeup",
      description: "Creative and theatrical makeup artistry",
      price: 100,
      duration_minutes: 120,
      isRecommended: true,
    },
  ],
  "lash-technician": [
    {
      name: "Classic Lash Extensions",
      description: "Individual lash extensions for natural look",
      price: 80,
      duration_minutes: 120,
      isRecommended: true,
    },
    {
      name: "Volume Lash Extensions",
      description: "Multiple lashes per natural lash for volume",
      price: 100,
      duration_minutes: 150,
      isRecommended: true,
    },
    {
      name: "Lash Lift",
      description: "Natural lash lifting and curling treatment",
      price: 45,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Lash Tint",
      description: "Eyelash tinting for enhanced definition",
      price: 20,
      duration_minutes: 30,
      isRecommended: true,
    },
    {
      name: "Lash Fill",
      description: "Maintenance fill for existing extensions",
      price: 50,
      duration_minutes: 90,
      isRecommended: true,
    },
    {
      name: "Lash Removal",
      description: "Safe removal of lash extensions",
      price: 25,
      duration_minutes: 45,
      isRecommended: true,
    },
  ],
  "massage-therapist": [
    {
      name: "Swedish Massage",
      description: "Relaxing full-body Swedish massage",
      price: 70,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Deep Tissue Massage",
      description: "Therapeutic deep tissue muscle work",
      price: 80,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Hot Stone Massage",
      description: "Relaxing massage with heated stones",
      price: 90,
      duration_minutes: 75,
      isRecommended: true,
    },
    {
      name: "Sports Massage",
      description: "Targeted massage for athletes and active individuals",
      price: 75,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Prenatal Massage",
      description: "Specialized massage for expecting mothers",
      price: 85,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Chair Massage",
      description: "Quick relaxation massage in seated position",
      price: 40,
      duration_minutes: 30,
      isRecommended: true,
    },
  ],
  "tattoo-artist": [
    {
      name: "Small Tattoo",
      description: "Simple tattoo design under 3 inches",
      price: 80,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Medium Tattoo",
      description: "Detailed tattoo design 3-6 inches",
      price: 150,
      duration_minutes: 120,
      isRecommended: true,
    },
    {
      name: "Large Tattoo Session",
      description: "Extended session for large tattoo work",
      price: 200,
      duration_minutes: 180,
      isRecommended: true,
    },
    {
      name: "Tattoo Consultation",
      description: "Design consultation and planning session",
      price: 50,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Cover-up Tattoo",
      description: "Covering existing tattoo with new design",
      price: 180,
      duration_minutes: 150,
      isRecommended: true,
    },
    {
      name: "Touch-up Session",
      description: "Healing touch-up for existing tattoo",
      price: 60,
      duration_minutes: 60,
      isRecommended: true,
    },
  ],
  "permanent-makeup": [
    {
      name: "Microblading",
      description: "Semi-permanent eyebrow hair strokes",
      price: 300,
      duration_minutes: 150,
      isRecommended: true,
    },
    {
      name: "Powder Brows",
      description: "Soft powder eyebrow technique",
      price: 280,
      duration_minutes: 120,
      isRecommended: true,
    },
    {
      name: "Lip Blush",
      description: "Semi-permanent lip color enhancement",
      price: 350,
      duration_minutes: 120,
      isRecommended: true,
    },
    {
      name: "Eyeliner Tattoo",
      description: "Permanent eyeliner application",
      price: 250,
      duration_minutes: 90,
      isRecommended: true,
    },
    {
      name: "Touch-up Session",
      description: "Maintenance touch-up for existing work",
      price: 100,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Color Correction",
      description: "Correcting previous permanent makeup",
      price: 200,
      duration_minutes: 120,
      isRecommended: true,
    },
  ],
  "wellness-coach": [
    {
      name: "Initial Consultation",
      description: "Comprehensive health and wellness assessment",
      price: 80,
      duration_minutes: 90,
      isRecommended: true,
    },
    {
      name: "Nutrition Coaching",
      description: "Personalized nutrition guidance session",
      price: 60,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Fitness Planning",
      description: "Custom fitness plan development",
      price: 70,
      duration_minutes: 75,
      isRecommended: true,
    },
    {
      name: "Lifestyle Coaching",
      description: "Holistic lifestyle improvement session",
      price: 65,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Stress Management",
      description: "Stress reduction and management techniques",
      price: 55,
      duration_minutes: 45,
      isRecommended: true,
    },
    {
      name: "Follow-up Session",
      description: "Progress review and plan adjustment",
      price: 50,
      duration_minutes: 45,
      isRecommended: true,
    },
  ],
  other: [
    {
      name: "Consultation",
      description: "Initial consultation and service planning",
      price: 30,
      duration_minutes: 30,
      isRecommended: true,
    },
    {
      name: "Basic Service",
      description: "Standard service offering",
      price: 50,
      duration_minutes: 60,
      isRecommended: true,
    },
    {
      name: "Premium Service",
      description: "Enhanced service with additional benefits",
      price: 80,
      duration_minutes: 90,
      isRecommended: true,
    },
    {
      name: "Package Deal",
      description: "Multiple services bundled together",
      price: 120,
      duration_minutes: 120,
      isRecommended: true,
    },
  ],
}

const ACTIVITY_NAMES: Record<string, string> = {
  barber: "Barber",
  "hair-stylist": "Hair Stylist",
  "nail-artist": "Nail Artist",
  esthetician: "Esthetician",
  "brow-specialist": "Brow Specialist",
  "makeup-artist": "Makeup Artist",
  "lash-technician": "Lash Technician",
  "massage-therapist": "Massage Therapist",
  "tattoo-artist": "Tattoo Artist",
  "permanent-makeup": "Permanent Makeup Artist",
  "wellness-coach": "Wellness Coach",
  other: "Other",
}

export function Step3Services({ storeId, selectedActivity, onNext, onBack }: Step3ServicesProps) {
  const [services, setServices] = useState<Service[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form fields for adding custom services
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")

  // Load recommended services based on selected activity
  useEffect(() => {
    const recommendedServices = SERVICE_RECOMMENDATIONS[selectedActivity] || SERVICE_RECOMMENDATIONS["other"]
    setServices([...recommendedServices])
  }, [selectedActivity])

  const handleAddRecommendedService = (service: Service) => {
    if (!services.find((s) => s.name === service.name)) {
      setServices((prev) => [...prev, { ...service }])
    }
  }

  const handleRemoveService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddCustomService = () => {
    if (name && price && duration) {
      const newService: Service = {
        name,
        description,
        price: Number.parseFloat(price),
        duration_minutes: Number.parseInt(duration),
        isRecommended: false,
      }
      setServices((prev) => [...prev, newService])

      // Reset form
      setName("")
      setDescription("")
      setPrice("")
      setDuration("")
      setShowAddForm(false)
    }
  }

  const handleContinue = async () => {
    if (services.length === 0) {
      setError("Please add at least one service to continue")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Save all services
      for (const service of services) {
        const response = await fetch("/api/barber/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId,
            name: service.name,
            description: service.description,
            price: service.price,
            duration_minutes: service.duration_minutes,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to save service")
        }
      }

      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save services")
    } finally {
      setLoading(false)
    }
  }

  const activityName = ACTIVITY_NAMES[selectedActivity] || "Your Activity"
  const recommendedServices = SERVICE_RECOMMENDATIONS[selectedActivity] || []

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Recommended for {activityName}
          </Badge>
        </div>
        <h2 className="text-2xl font-bold">Set Up Your Services</h2>
        <p className="text-muted-foreground">
          We've curated some popular services for {activityName.toLowerCase()}s. Select the ones you offer or add your
          own.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Recommended Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommended Services</h3>
        <div className="grid gap-3">
          {recommendedServices.map((service, index) => {
            const isAdded = services.find((s) => s.name === service.name)
            return (
              <Card key={index} className={`transition-all ${isAdded ? "bg-green-50 border-green-200" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{service.name}</h4>
                        {isAdded && <Check className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">€{service.price}</span>
                        <span className="text-muted-foreground">{service.duration_minutes} min</span>
                      </div>
                    </div>
                    <Button
                      variant={isAdded ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleAddRecommendedService(service)}
                      disabled={!!isAdded}
                    >
                      {isAdded ? "Added" : "Add"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Selected Services */}
      {services.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Services ({services.length})</h3>
          <div className="grid gap-3">
            {services.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{service.name}</h4>
                        {service.isRecommended && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">€{service.price}</span>
                        <span className="text-muted-foreground">{service.duration_minutes} min</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveService(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Service */}
      <div className="space-y-4">
        {!showAddForm ? (
          <Button variant="outline" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Service
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Premium Haircut"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your service..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCustomService} disabled={!name || !price || !duration}>
                  Add Service
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={loading || services.length === 0} className="min-w-[120px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </div>
    </div>
  )
}
