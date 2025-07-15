"use client"

import type { FormEvent } from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, PlusCircle, Trash2, CheckCircle2 } from "lucide-react"
import { Textarea } from "../ui/textarea"

interface Service {
  id?: string
  name: string
  price: number
  duration: number
  description: string
}

interface Step2ServicesProps {
  storeId: string
  onNext: () => void
  onBack: () => void
}

const SUGGESTED_SERVICES = [
  { name: "Men's Haircut", price: 30, duration: 30, description: "Classic haircut for men." },
  { name: "Women's Haircut", price: 50, duration: 60, description: "Stylish haircut for women." },
  { name: "Beard Trim", price: 15, duration: 15, description: "Professional beard trimming and shaping." },
  { name: "Shave", price: 25, duration: 30, description: "Traditional hot towel shave." },
  { name: "Hair Coloring", price: 80, duration: 90, description: "Full hair coloring service." },
  { name: "Kids Haircut", price: 20, duration: 20, description: "Haircut for children under 12." },
]

export function Step2Services({ storeId, onNext, onBack }: Step2ServicesProps) {
  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState<Service>({ name: "", price: 0, duration: 30, description: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/barber/services?storeId=${storeId}`)
        if (response.ok) {
          const data = await response.json()
          setServices(data.map((s: any) => ({ ...s, duration: s.duration_minutes })))
        } else {
          console.error("Failed to fetch services:", response.statusText)
        }
      } catch (error) {
        console.error("Failed to fetch services", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchServices()
  }, [storeId])

  const handleAddService = async (serviceToAdd: Service) => {
    setIsAdding(true)
    try {
      const response = await fetch(`/api/barber/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...serviceToAdd, storeId }),
      })

      if (response.ok) {
        const addedService = await response.json()
        setServices((prev) => [...prev, { ...addedService, duration: addedService.duration_minutes }])
        setNewService({ name: "", price: 0, duration: 30, description: "" }) // Clear custom service form
      } else {
        console.error("Failed to add service:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to add service", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleCustomServiceSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!newService.name || newService.price <= 0 || newService.duration <= 0) return
    handleAddService(newService)
  }

  const handleDeleteService = async (serviceId: string | undefined) => {
    if (!serviceId) return
    setIsDeleting(serviceId)
    try {
      const response = await fetch(`/api/barber/services/${serviceId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setServices(services.filter((s) => s.id !== serviceId))
      } else {
        console.error("Failed to delete service:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to delete service", error)
    } finally {
      setIsDeleting(null)
    }
  }

  const isServiceAdded = (serviceName: string) => {
    return services.some((s) => s.name === serviceName)
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Your Services</CardTitle>
          <CardDescription>Add the services you offer. You can add more later.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="mb-4 text-lg font-medium">Suggested Services</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUGGESTED_SERVICES.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-muted-foreground">
                    ${service.price} • {service.duration} min
                  </p>
                </div>
                {isServiceAdded(service.name) ? (
                  <Button variant="ghost" size="icon" disabled>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleAddService(service)} disabled={isAdding}>
                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <h3 className="mb-4 mt-8 text-lg font-medium">Current Services</h3>
          <div className="space-y-4">
            {services.length === 0 && (
              <p className="text-muted-foreground">
                No services added yet. Add some from suggestions or create custom ones.
              </p>
            )}
            {services.map((service, index) => (
              <div key={service.id || index} className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${service.price} • {service.duration} min
                  </p>
                  {service.description && <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteService(service.id)}
                  disabled={isDeleting === service.id}
                >
                  {isDeleting === service.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          <form onSubmit={handleCustomServiceSubmit} className="mt-6 space-y-4 rounded-lg border border-dashed p-4">
            <h3 className="text-lg font-medium">Add New Custom Service</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="custom-name">Service Name</Label>
                <Input
                  id="custom-name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g., Men's Haircut"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-price">Price ($)</Label>
                <Input
                  id="custom-price"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-duration">Duration (min)</Label>
                <Input
                  id="custom-duration"
                  type="number"
                  step="5"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                  required
                  min="5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-description">Description (Optional)</Label>
              <Textarea
                id="custom-description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Describe the service"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" disabled={isAdding}>
              {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Add Custom Service
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={services.length === 0}>
          Next
        </Button>
      </div>
    </div>
  )
}
