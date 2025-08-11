"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Sparkles, Loader2 } from "lucide-react"
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
  storeId?: string  // Make storeId optional
  selectedActivity: string
  onNext: () => void
  onBack: () => void
}

// Activity categories
const ACTIVITY_CATEGORIES = {
  barber: [
    {
      id: "coupe_femme",
      name: "Coupe & Coiffage – Femme",
      description: "Coupes et coiffage pour femmes",
      icon: "💇‍♀️",
    },
    {
      id: "coupe_homme",
      name: "Coupe Homme & Enfant",
      description: "Coupes classiques et modernes pour hommes et enfants",
      icon: "💇‍♂️",
    },
    {
      id: "coloration",
      name: "Coloration & Mèches",
      description: "Services de coloration et mèches",
      icon: "🎨",
    },
    {
      id: "soins_lissages",
      name: "Soins & Lissages",
      description: "Soins capillaires et lissages",
      icon: "💆‍♀️",
    },
  ],
  nail_artist: [
    {
      id: "pose_ongles",
      name: "Pose d'ongles – Gel / Résine / Acrygel",
      description: "Pose et remplissage d'ongles",
      icon: "💅",
    },
    {
      id: "nail_art",
      name: "Nail Art & Déco",
      description: "Décoration et nail art",
      icon: "🎨",
    },
    {
      id: "semi_permanent",
      name: "Vernis Semi-Permanent",
      description: "Pose et dépose de vernis semi-permanent",
      icon: "💅",
    },
    {
      id: "beaute_pieds",
      name: "Beauté des pieds",
      description: "Soins des pieds et pédicure",
      icon: "🦶",
    },
  ],
}

// Category-specific service recommendations
const CATEGORY_SERVICES = {
  // Barber services
  coupe_femme: [
    {
      name: "Shampoing + Coupe + Brushing",
      description: "Service complet de coupe femme avec brushing",
      price: 40,
      duration_minutes: 45,
    },
    {
      name: "Shampoing + Brushing",
      description: "Shampoing et brushing uniquement",
      price: 25,
      duration_minutes: 30,
    },
    {
      name: "Coupe seule",
      description: "Coupe de cheveux uniquement",
      price: 20,
      duration_minutes: 20,
    },
    {
      name: "Brushing cheveux longs",
      description: "Brushing spécialisé pour cheveux longs",
      price: 30,
      duration_minutes: 45,
    },
    {
      name: "Lissage express",
      description: "Lissage rapide et efficace",
      price: 45,
      duration_minutes: 45,
    },
    {
      name: "Wavy ou boucles",
      description: "Création de waves ou boucles avec brushing",
      price: 35,
      duration_minutes: 45,
    },
  ],
  coupe_homme: [
    {
      name: "Coupe homme classique",
      description: "Coupe classique pour hommes",
      price: 20,
      duration_minutes: 20,
    },
    {
      name: "Coupe dégradé / fade",
      description: "Coupe moderne avec dégradé",
      price: 25,
      duration_minutes: 25,
    },
    {
      name: "Coupe tondeuse",
      description: "Coupe rapide à la tondeuse",
      price: 15,
      duration_minutes: 15,
    },
    {
      name: "Taille de barbe",
      description: "Taille et entretien de barbe",
      price: 10,
      duration_minutes: 15,
    },
    {
      name: "Coupe enfant (-12 ans)",
      description: "Coupe spécialisée pour enfants",
      price: 15,
      duration_minutes: 20,
    },
  ],
  coloration: [
    {
      name: "Coloration racines",
      description: "Retouche des racines",
      price: 35,
      duration_minutes: 45,
    },
    {
      name: "Coloration complète",
      description: "Coloration sur toute la chevelure",
      price: 50,
      duration_minutes: 60,
    },
    {
      name: "Mèches (papier)",
      description: "Mèches avec papier aluminium",
      price: 70,
      duration_minutes: 90,
    },
    {
      name: "Balayage",
      description: "Technique de balayage naturel",
      price: 65,
      duration_minutes: 90,
    },
    {
      name: "Patine",
      description: "Patine pour nuancer la couleur",
      price: 20,
      duration_minutes: 20,
    },
    {
      name: "Décoloration",
      description: "Décoloration des cheveux",
      price: 60,
      duration_minutes: 75,
    },
  ],
  soins_lissages: [
    {
      name: "Soin profond + massage crânien",
      description: "Soin en profondeur avec massage",
      price: 20,
      duration_minutes: 20,
    },
    {
      name: "Botox capillaire",
      description: "Traitement botox pour cheveux",
      price: 80,
      duration_minutes: 90,
    },
    {
      name: "Lissage brésilien",
      description: "Lissage brésilien longue durée",
      price: 150,
      duration_minutes: 150,
    },
    {
      name: "Lissage tanin",
      description: "Lissage au tanin naturel",
      price: 130,
      duration_minutes: 150,
    },
  ],
  // Nail artist services
  pose_ongles: [
    {
      name: "Pose complète gel sur ongles naturels",
      description: "Pose de gel sur ongles naturels",
      price: 45,
      duration_minutes: 90,
    },
    {
      name: "Pose complète avec rallongement",
      description: "Pose avec rallongement (capsules ou chablons)",
      price: 55,
      duration_minutes: 120,
    },
    {
      name: "Remplissage gel",
      description: "Remplissage et retouche gel",
      price: 40,
      duration_minutes: 90,
    },
    {
      name: "Pose complète acrygel",
      description: "Pose complète en acrygel",
      price: 50,
      duration_minutes: 120,
    },
    {
      name: "Remplissage acrygel",
      description: "Remplissage et retouche acrygel",
      price: 45,
      duration_minutes: 90,
    },
    {
      name: "Pose résine",
      description: "Pose complète en résine",
      price: 50,
      duration_minutes: 105,
    },
    {
      name: "Dépose + soin",
      description: "Dépose complète avec soin des ongles",
      price: 15,
      duration_minutes: 30,
    },
  ],
  nail_art: [
    {
      name: "Nail art simple",
      description: "Nail art simple (1 ou 2 ongles décorés)",
      price: 5,
      duration_minutes: 10,
    },
    {
      name: "Nail art complet",
      description: "Nail art complet (main entière décorée)",
      price: 12.5,
      duration_minutes: 30,
    },
    {
      name: "Babyboomer / French classique",
      description: "French manucure ou babyboomer",
      price: 7.5,
      duration_minutes: 20,
    },
    {
      name: "Effets spéciaux",
      description: "Effets spéciaux (chrome, sirène, etc.)",
      price: 7.5,
      duration_minutes: 15,
    },
  ],
  semi_permanent: [
    {
      name: "Pose semi-permanent mains",
      description: "Pose de vernis semi-permanent pour les mains",
      price: 25,
      duration_minutes: 45,
    },
    {
      name: "Dépose semi-permanent + nouvelle pose",
      description: "Dépose de l'ancien et nouvelle pose",
      price: 30,
      duration_minutes: 60,
    },
    {
      name: "Dépose seule semi-permanent",
      description: "Dépose uniquement du vernis semi-permanent",
      price: 10,
      duration_minutes: 20,
    },
    {
      name: "Pose semi-permanent pieds",
      description: "Pose de vernis semi-permanent pour les pieds",
      price: 25,
      duration_minutes: 45,
    },
    {
      name: "Mains + pieds semi-permanent",
      description: "Pose semi-permanent mains et pieds complète",
      price: 45,
      duration_minutes: 90,
    },
  ],
  beaute_pieds: [
    {
      name: "Beauté des pieds express",
      description: "Soin express pour la beauté des pieds",
      price: 20,
      duration_minutes: 30,
    },
    {
      name: "Beauté des pieds complète + semi-permanent",
      description: "Soin complet des pieds avec vernis semi-permanent",
      price: 35,
      duration_minutes: 60,
    },
    {
      name: "Calluspeeling",
      description: "Soin anti-callosités spécialisé",
      price: 30,
      duration_minutes: 30,
    },
  ],
}

// Get activity display name
const getActivityDisplayName = (activityId: string): string => {
  const activityNames: Record<string, string> = {
    barber: "The Hair Studio",
    nail_artist: "Nail Artist",
  }
  return activityNames[activityId] || "Services"
}

export function Step3Services({ storeId, selectedActivity, onNext, onBack }: Step3ServicesProps) {
  const [services, setServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
  })
  const { toast } = useToast()

  // Get categories and services for the selected activity
  const availableCategories = ACTIVITY_CATEGORIES[selectedActivity as keyof typeof ACTIVITY_CATEGORIES] || []
  const suggestedServices = selectedCategory 
    ? CATEGORY_SERVICES[selectedCategory as keyof typeof CATEGORY_SERVICES] || []
    : []
  const activityDisplayName = getActivityDisplayName(selectedActivity)

  // Fetch existing services - only if storeId is available
  useEffect(() => {
    if (storeId) {
      fetchServices()
    }
  }, [storeId])

  const fetchServices = async () => {
    if (!storeId) {
      console.log("No storeId available, skipping service fetch")
      return
    }
    
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
    if (!storeId) {
      toast({
        title: "Store Creation Required",
        description: "Please complete the store setup first.",
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

    if (!storeId) {
      toast({
        title: "Store Creation Required",
        description: "Please complete the store setup first.",
        variant: "destructive",
      })
      return
    }

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
    if (!storeId) return

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

  const handleCategorySelect = async (categoryId: string) => {
    // Don't set selectedCategory anymore, just add services
    // setSelectedCategory(categoryId)
    
    // Automatically add all services from this category
    const categoryServices = CATEGORY_SERVICES[categoryId as keyof typeof CATEGORY_SERVICES] || []
    
    if (categoryServices.length > 0 && storeId) {
      setIsLoading(true)
      let addedCount = 0
      
      try {
        for (const service of categoryServices) {
          // Check if service already exists
          const exists = services.some((existingService) => 
            existingService.name.toLowerCase() === service.name.toLowerCase()
          )
          
          if (!exists) {
            const response = await fetch("/api/barber/services", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                storeId,
                ...service,
              }),
            })

            if (response.ok) {
              const result = await response.json()
              setServices((prev) => [...prev, result.service])
              addedCount++
            }
          }
        }
        
        if (addedCount > 0) {
          toast({
            title: "Services Added",
            description: `${addedCount} services have been added automatically to your store.`,
          })
        } else {
          toast({
            title: "No New Services",
            description: "All services from this category are already in your store.",
          })
        }
      } catch (error) {
        console.error("Failed to add services:", error)
        toast({
          title: "Error",
          description: "Failed to add some services. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else if (!storeId) {
      toast({
        title: "Store Creation Required",
        description: "Please complete the store setup first.",
        variant: "destructive",
      })
    }
  }

  const availableSuggestions = suggestedServices.filter(
    (suggested) => !services.some((service) => service.name.toLowerCase() === suggested.name.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Show a message if no storeId */}
      {!storeId && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">Store setup in progress... Services will be available once your store is created.</p>
        </div>
      )}
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <Badge variant="secondary" className="text-sm">
            {activityDisplayName} Services
          </Badge>
        </div>
        <h2 className="text-xl font-semibold mb-2">Choose Your Category</h2>
        <p className="text-muted-foreground">
          First, select the category of services you want to offer, then add specific services.
        </p>
      </div>

      {/* Category Selection - Always show */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {activityDisplayName} Categories
          </CardTitle>
          <CardDescription>
            Choose categories and all their services will be added automatically to your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding services automatically...
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableCategories.map((category) => {
              // Check if all services from this category are already added
              const categoryServices = CATEGORY_SERVICES[category.id as keyof typeof CATEGORY_SERVICES] || []
              const allServicesAdded = categoryServices.every(categoryService => 
                services.some(service => service.name.toLowerCase() === categoryService.name.toLowerCase())
              )
              
              return (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    isLoading 
                      ? 'opacity-50 pointer-events-none' 
                      : allServicesAdded 
                        ? 'bg-green-50 border-green-200 opacity-75'
                        : 'hover:bg-muted/50'
                  }`}
                  onClick={() => !isLoading && !allServicesAdded && handleCategorySelect(category.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{category.icon}</span>
                      <h4 className="font-medium">{category.name}</h4>
                      {allServicesAdded && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Added
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <p className="text-xs text-primary mt-1">
                      {allServicesAdded 
                        ? `All ${categoryServices.length} services added`
                        : `Will add ${categoryServices.length} services`
                      }
                    </p>
                  </div>
                  {!allServicesAdded && <Plus className="h-5 w-5 text-primary" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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

      {/* Add Custom Service - show when there are services */}
      {services.length > 0 && (
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
      )}

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