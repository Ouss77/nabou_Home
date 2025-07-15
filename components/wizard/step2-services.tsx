"use client"

import type { FormEvent } from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, PlusCircle, Trash2 } from "lucide-react"
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

export function Step2Services({ storeId, onNext, onBack }: Step2ServicesProps) {
  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState<Service>({ name: "", price: 0, duration: 30, description: "" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/barber/services?storeId=${storeId}`)
        if (response.ok) {
          const data = await response.json()
          setServices(data.map((s: any) => ({ ...s, duration: s.duration_minutes })))
        }
      } catch (error) {
        console.error("Failed to fetch services", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchServices()
  }, [storeId])

  const handleAddService = async (e: FormEvent) => {
    e.preventDefault()
    if (!newService.name || newService.price <= 0 || newService.duration <= 0) return

    const response = await fetch(`/api/barber/services?storeId=${storeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService),
    })

    if (response.ok) {
      const addedService = await response.json()
      setServices([...services, { ...addedService, duration: addedService.duration_minutes }])
      setNewService({ name: "", price: 0, duration: 30, description: "" })
    }
  }

  const handleDeleteService = async (serviceId: string | undefined) => {
    if (!serviceId) return
    const response = await fetch(`/api/barber/services?id=${serviceId}`, {
      method: "DELETE",
    })
    if (response.ok) {
      setServices(services.filter((s) => s.id !== serviceId))
    }
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
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={service.id || index} className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${service.price} • {service.duration} min
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddService} className="mt-6 space-y-4 rounded-lg border border-dashed p-4">
            <h3 className="text-lg font-medium">Add New Service</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g., Men's Haircut"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  step="5"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Describe the service"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
