"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { Textarea } from "../ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Scissors, Plus, Clock, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

interface Step2ServicesProps {
  storeId: string
  onNext: () => void
  onBack: () => void
}

// Suggested services that barbers can quickly add
const SUGGESTED_SERVICES = [
  { name: "Haircut", description: "Classic men's haircut", price: 25, duration_minutes: 30 },
  { name: "Beard Trim", description: "Professional beard trimming and shaping", price: 15, duration_minutes: 20 },
  { name: "Haircut + Beard", description: "Complete haircut and beard service", price: 35, duration_minutes: 45 },
  { name: "Shave", description: "Traditional hot towel shave", price: 20, duration_minutes: 25 },
  { name: "Hair Wash", description: "Shampoo and conditioning", price: 10, duration_minutes: 15 },
  { name: "Mustache Trim", description: "Precision mustache grooming", price: 8, duration_minutes: 10 },
]

export function Step3Services({ storeId, onNext, onBack }: Step2ServicesProps) {
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

  const handleAddSuggestedService = async (suggestedService: (typeof SUGGESTED_SERVICES)[0]) => {
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

  const availableSuggestions = SUGGESTED_SERVICES.filter(
    (suggested) => !services.some((service) => service.name.toLowerCase() === suggested.name.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Scissors className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Add Your Services</h2>
        <p className="text-muted-foreground">Choose from popular services or add your own custom services.</p>
      </div>

      {/* Suggested Services */}
      {availableSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
            <CardDescription>Click to quickly add these common barbershop services.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableSuggestions.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
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
            <CardDescription>Services that customers can book at your barbershop.</CardDescription>
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
                    placeholder="e.g., Premium Cut"
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
                    placeholder="25.00"
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
                  placeholder="30"
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
