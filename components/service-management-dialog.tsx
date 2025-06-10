"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2, Edit } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

interface ServiceManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  services: Service[]
  onSuccess: () => void
}

export function ServiceManagementDialog({
  open,
  onOpenChange,
  storeId,
  services,
  onSuccess,
}: ServiceManagementDialogProps) {
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setDuration("")
    setEditingService(null)
    setShowAddForm(false)
    setError("")
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setName(service.name)
    setDescription(service.description)
    setPrice(service.price.toString())
    setDuration(service.duration_minutes.toString())
    setShowAddForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = editingService ? `/api/barber/services/${editingService.id}` : "/api/barber/services"
      const method = editingService ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          name,
          description,
          price: Number.parseFloat(price),
          durationMinutes: Number.parseInt(duration),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save service")
      }

      resetForm()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/barber/services/${serviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete service")
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Services</DialogTitle>
          <DialogDescription>Add, edit, or remove services for your barbershop</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Add/Edit Service Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingService ? "Edit Service" : "Add New Service"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Service Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g., Classic Haircut"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
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
                      required
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe this service..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingService ? "Update Service" : "Add Service"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Add Service Button */}
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Button>
          )}

          {/* Services List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Services</h3>
            {services.length === 0 ? (
              <p className="text-muted-foreground">No services added yet.</p>
            ) : (
              <div className="grid gap-4">
                {services.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>${service.price}</span>
                            <span>{service.duration_minutes} minutes</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
