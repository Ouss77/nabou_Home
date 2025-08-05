"use client"

import type React from "react"
import { useState, useEffect, useLayoutEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Sparkles } from "lucide-react"
import { Textarea } from "../ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

interface Step3ServicesProps {
  storeId: string
  selectedActivity: string
  onNext: () => void
  onBack: () => void
}

// Activity-specific service recommendations
const ACTIVITY_SERVICES = {
  barber: [
    {
      name: "Classic Haircut",
      description: "Traditional men's haircut with scissors and clippers",
      price: 25,
      duration_minutes: 30,
    },
    { name: "Beard Trim", description: "Professional beard trimming and shaping", price: 15, duration_minutes: 20 },
    {
      name: "Hot Towel Shave",
      description: "Traditional straight razor shave with hot towel",
      price: 30,
      duration_minutes: 45,
    },
    { name: "Fade Cut", description: "Modern fade haircut with precise blending", price: 28, duration_minutes: 35 },
    { name: "Mustache Trim", description: "Precision mustache grooming and styling", price: 8, duration_minutes: 10 },
    { name: "Hair Wash & Style", description: "Shampoo, conditioning, and styling", price: 12, duration_minutes: 15 },
  ],
  hairstylist: [
    { name: "Women's Cut & Style", description: "Haircut with blow-dry and styling", price: 45, duration_minutes: 60 },
    { name: "Hair Color", description: "Full hair coloring service", price: 80, duration_minutes: 120 },
    { name: "Highlights", description: "Partial or full highlights", price: 90, duration_minutes: 150 },
    { name: "Blowout", description: "Professional blow-dry and styling", price: 25, duration_minutes: 30 },
    { name: "Hair Treatment", description: "Deep conditioning and repair treatment", price: 35, duration_minutes: 45 },
    { name: "Updo Styling", description: "Special occasion updo hairstyling", price: 50, duration_minutes: 60 },
  ],
  nail_artist: [
    {
      name: "Classic Manicure",
      description: "Traditional manicure with regular polish",
      price: 20,
      duration_minutes: 45,
    },
    { name: "Gel Manicure", description: "Long-lasting gel polish manicure", price: 30, duration_minutes: 60 },
    { name: "Classic Pedicure", description: "Foot care and regular polish pedicure", price: 25, duration_minutes: 60 },
    { name: "Gel Pedicure", description: "Pedicure with gel polish finish", price: 35, duration_minutes: 75 },
    { name: "Nail Art", description: "Custom nail art and designs", price: 15, duration_minutes: 30 },
    { name: "Nail Extensions", description: "Acrylic or gel nail extensions", price: 40, duration_minutes: 90 },
  ],
  esthetician: [
    { name: "Classic Facial", description: "Deep cleansing and moisturizing facial", price: 60, duration_minutes: 60 },
    { name: "Anti-Aging Facial", description: "Advanced anti-aging treatment", price: 80, duration_minutes: 75 },
    { name: "Acne Treatment", description: "Specialized acne and blemish treatment", price: 70, duration_minutes: 60 },
    { name: "Chemical Peel", description: "Professional chemical exfoliation", price: 90, duration_minutes: 45 },
    { name: "Microdermabrasion", description: "Skin resurfacing treatment", price: 75, duration_minutes: 50 },
    { name: "Hydrating Facial", description: "Intensive moisture restoration", price: 65, duration_minutes: 60 },
  ],
  brow_specialist: [
    { name: "Eyebrow Threading", description: "Precise eyebrow shaping with thread", price: 15, duration_minutes: 20 },
    { name: "Eyebrow Waxing", description: "Quick and effective brow shaping", price: 12, duration_minutes: 15 },
    { name: "Brow Tinting", description: "Semi-permanent eyebrow coloring", price: 20, duration_minutes: 30 },
    { name: "Brow Lamination", description: "Eyebrow restructuring and setting", price: 35, duration_minutes: 45 },
    { name: "Microblading", description: "Semi-permanent eyebrow tattooing", price: 250, duration_minutes: 120 },
    { name: "Brow Mapping", description: "Professional brow shape consultation", price: 25, duration_minutes: 30 },
  ],
  makeup_artist: [
    { name: "Event Makeup", description: "Professional makeup for special events", price: 60, duration_minutes: 60 },
    { name: "Bridal Makeup", description: "Wedding day makeup application", price: 100, duration_minutes: 90 },
    { name: "Photoshoot Makeup", description: "Camera-ready makeup for photos", price: 80, duration_minutes: 75 },
    { name: "Makeup Lesson", description: "Personal makeup application tutorial", price: 70, duration_minutes: 90 },
    { name: "Prom Makeup", description: "Special occasion makeup for prom", price: 50, duration_minutes: 60 },
    { name: "Makeup Trial", description: "Practice session before main event", price: 40, duration_minutes: 45 },
  ],
  lash_technician: [
    {
      name: "Classic Lash Extensions",
      description: "Natural-looking individual lash extensions",
      price: 80,
      duration_minutes: 120,
    },
    {
      name: "Volume Lash Extensions",
      description: "Fuller, dramatic lash extensions",
      price: 100,
      duration_minutes: 150,
    },
    { name: "Lash Fill", description: "Maintenance for existing extensions", price: 45, duration_minutes: 60 },
    { name: "Lash Lift", description: "Natural lash curling and lifting", price: 50, duration_minutes: 60 },
    { name: "Lash Tinting", description: "Semi-permanent lash coloring", price: 25, duration_minutes: 30 },
    { name: "Lash Removal", description: "Safe removal of lash extensions", price: 20, duration_minutes: 30 },
  ],
  massage_therapist: [
    { name: "Swedish Massage", description: "Relaxing full-body massage", price: 70, duration_minutes: 60 },
    { name: "Deep Tissue Massage", description: "Therapeutic muscle tension relief", price: 80, duration_minutes: 60 },
    { name: "Hot Stone Massage", description: "Massage with heated stones", price: 90, duration_minutes: 75 },
    { name: "Sports Massage", description: "Athletic recovery and injury prevention", price: 75, duration_minutes: 60 },
    {
      name: "Prenatal Massage",
      description: "Specialized massage for expecting mothers",
      price: 85,
      duration_minutes: 60,
    },
    { name: "Chair Massage", description: "Quick tension relief massage", price: 40, duration_minutes: 30 },
  ],
  tattoo_artist: [
    { name: "Small Tattoo", description: "Simple design under 2 inches", price: 80, duration_minutes: 60 },
    { name: "Medium Tattoo", description: "Design 2-4 inches", price: 150, duration_minutes: 120 },
    { name: "Large Tattoo", description: "Complex design over 4 inches", price: 250, duration_minutes: 180 },
    { name: "Tattoo Touch-up", description: "Color refresh and line work", price: 60, duration_minutes: 45 },
    { name: "Cover-up Tattoo", description: "Covering existing tattoo", price: 200, duration_minutes: 150 },
    { name: "Consultation", description: "Design consultation and planning", price: 30, duration_minutes: 30 },
  ],
  permanent_makeup: [
    {
      name: "Eyebrow Microblading",
      description: "Semi-permanent eyebrow hair strokes",
      price: 300,
      duration_minutes: 150,
    },
    { name: "Lip Blush", description: "Semi-permanent lip color enhancement", price: 250, duration_minutes: 120 },
    { name: "Eyeliner Tattoo", description: "Permanent eyeliner application", price: 200, duration_minutes: 90 },
    { name: "Touch-up Session", description: "Color refresh for existing work", price: 100, duration_minutes: 60 },
    { name: "Color Correction", description: "Fixing previous permanent makeup", price: 150, duration_minutes: 90 },
    { name: "Consultation", description: "Design and color consultation", price: 50, duration_minutes: 45 },
  ],
  wellness_coach: [
    {
      name: "Initial Consultation",
      description: "Comprehensive health and wellness assessment",
      price: 80,
      duration_minutes: 90,
    },
    { name: "Follow-up Session", description: "Progress review and plan adjustment", price: 60, duration_minutes: 60 },
    {
      name: "Nutrition Planning",
      description: "Personalized meal and nutrition guidance",
      price: 70,
      duration_minutes: 75,
    },
    {
      name: "Fitness Consultation",
      description: "Exercise plan and fitness guidance",
      price: 65,
      duration_minutes: 60,
    },
    { name: "Stress Management", description: "Techniques for stress reduction", price: 55, duration_minutes: 45 },
    { name: "Group Workshop", description: "Wellness workshop for multiple clients", price: 40, duration_minutes: 90 },
  ],
  other: [
    { name: "Consultation", description: "Initial service consultation", price: 30, duration_minutes: 30 },
    { name: "Basic Service", description: "Standard service offering", price: 50, duration_minutes: 60 },
    { name: "Premium Service", description: "Enhanced service with extras", price: 80, duration_minutes: 90 },
    { name: "Express Service", description: "Quick service option", price: 25, duration_minutes: 30 },
    { name: "Package Deal", description: "Multiple services combined", price: 120, duration_minutes: 120 },
    { name: "Follow-up", description: "Maintenance or touch-up service", price: 40, duration_minutes: 45 },
  ],
}

// Get activity display name
const getActivityDisplayName = (activityId: string): string => {
  const activityNames: Record<string, string> = {
    barber: "Barber",
    hairstylist: "Hair Stylist",
    nail_artist: "Nail Artist",
    esthetician: "Esthetician",
    brow_specialist: "Brow Specialist",
    makeup_artist: "Makeup Artist",
    lash_technician: "Lash Technician",
    massage_therapist: "Massage Therapist",
    tattoo_artist: "Tattoo Artist",
    permanent_makeup: "Permanent Makeup Artist",
    wellness_coach: "Wellness Coach",
    other: "Other Services",
  }
  return activityNames[activityId] || "Services"
}

export function Step3Services({ storeId, selectedActivity, onNext, onBack }: Step3ServicesProps) {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
  })
  const { toast } = useToast()

  // Get suggested services for the selected activity
  const suggestedServices =
    ACTIVITY_SERVICES[selectedActivity as keyof typeof ACTIVITY_SERVICES] || ACTIVITY_SERVICES.other
  const activityDisplayName = getActivityDisplayName(selectedActivity)

  // Fetch existing services
  useEffect(() => {
    fetchServices()
  }, [storeId])

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/barber/services?storeId=${storeId}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    }
  }

  const handleAddSuggestedService = async (suggestedService: (typeof suggestedServices)[0]) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/barber/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          ...suggestedService,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setServices((prev) => [...prev, result.service])
        toast({
          title: "Service Added",
          description: `${suggestedService.name} has been added to your services.`,
        })
      }
    } catch (error) {
      console.error("Failed to add service:", error)
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomService = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newService.name || !newService.price || !newService.duration_minutes) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/barber/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          name: newService.name,
          description: newService.description,
          price: Number.parseFloat(newService.price),
          duration_minutes: Number.parseInt(newService.duration_minutes),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setServices((prev) => [...prev, result.service])
        setNewService({ name: "", description: "", price: "", duration_minutes: "" })
        setShowAddForm(false)
        toast({
          title: "Service Added",
          description: `${newService.name} has been added to your services.`,
        })
      }
    } catch (error) {
      console.error("Failed to add service:", error)
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/barber/services/${serviceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setServices((prev) => prev.filter((service) => service.id !== serviceId))
        toast({
          title: "Service Removed",
          description: "Service has been removed from your store.",
        })
      }
    } catch (error) {
      console.error("Failed to delete service:", error)
      toast({
        title: "Error",
        description: "Failed to remove service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const availableSuggestions = suggestedServices.filter(
    (suggested) => !services.some((service) => service.name.toLowerCase() === suggested.name.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <Badge variant="secondary" className="text-sm">
            Recommended for {activityDisplayName}
          </Badge>
        </div>
        <h2 className="text-xl font-semibold mb-2">Add Your Services</h2>
        <p className="text-muted-foreground">
          We've curated popular services for {activityDisplayName.toLowerCase()}s. Add the ones you offer or create
          custom services.
        </p>
      </div>

      {/* Suggested Services */}
      {availableSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommended {activityDisplayName} Services
            </CardTitle>
            <CardDescription>
              Popular services for {activityDisplayName.toLowerCase()}s. Click to quickly add them to your offerings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableSuggestions.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleAddSuggestedService(service)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <DollarSign className="h-3 w-3 mr-1" />€{service.price}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {service.duration_minutes}min
                      </Badge>
                    </div>
                  </div>
                  <Plus className="h-5 w-5 text-primary" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Services */}
      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Services ({services.length})</CardTitle>
            <CardDescription>Services that customers can book at your business.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <DollarSign className="h-3 w-3 mr-1" />€{service.price}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {service.duration_minutes}min
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Custom Service */}
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Service</CardTitle>
          <CardDescription>Create a custom service with your own pricing and duration.</CardDescription>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Service
            </Button>
          ) : (
            <form onSubmit={handleAddCustomService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Premium Treatment"
                    value={newService.name}
                    onChange={(e) => setNewService((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    value={newService.price}
                    onChange={(e) => setNewService((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  value={newService.duration_minutes}
                  onChange={(e) => setNewService((prev) => ({ ...prev, duration_minutes: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this service..."
                  value={newService.description}
                  onChange={(e) => setNewService((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  Add Service
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={services.length === 0}>
          Continue to Working Hours
          {services.length === 0 && <span className="ml-2 text-xs">(Add at least one service)</span>}
        </Button>
      </div>
    </div>
  )
}
