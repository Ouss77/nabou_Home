"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, MapPin, FileText } from "lucide-react"

interface Step1StoreInfoProps {
  onNext: (store: any) => void
  initialData?: {
    title: string
    address: string
    description: string
    imageUrl: string
  }
}

export function Step1StoreInfo({ onNext, initialData }: Step1StoreInfoProps) {
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    description: "",
    imageUrl: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when component mounts or when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Store name is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onNext(formData) // Just pass the data to parent
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Store className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Tell us about your barbershop</h2>
        <p className="text-muted-foreground">
          This information will be displayed to customers when they book appointments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Provide basic details about your barbershop that customers will see.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Name or Nickname</Label>
              <div className="relative">
                <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder="e.g., Mike's Barbershop"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`pl-10 ${errors.title ? "border-red-500" : ""}`}
                />
              </div>
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="e.g., 123 Main Street, City, State"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`pl-10 ${errors.address ? "border-red-500" : ""}`}
                />
              </div>
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="Tell customers about your barbershop, specialties, experience..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="pl-10 min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Creating..." : "Continue to Services"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
