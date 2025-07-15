"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" // Corrected import
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createStore, updateStore, type Store } from "@/lib/db" // Import Store type

interface Step1StoreInfoProps {
  barberId: string
  onNext: (data: { id: string; title: string; address: string; description: string; imageUrl?: string }) => void
  initialData?: Store | null
  isEditing: boolean
}

export function Step1StoreInfo({ barberId, onNext, initialData, isEditing }: Step1StoreInfoProps) {
  const [storeName, setStoreName] = useState(initialData?.title || "")
  const [address, setAddress] = useState(initialData?.address || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setStoreName(initialData.title || "")
      setAddress(initialData.address || "")
      setDescription(initialData.description || "")
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!storeName || !address || !description) {
      setError("All fields are required.")
      setIsLoading(false)
      return
    }

    try {
      let store: Store
      if (isEditing && initialData?.id) {
        store = await updateStore(initialData.id, storeName, address, description)
      } else {
        store = await createStore(barberId, storeName, address, description)
      }
      onNext(store)
    } catch (err) {
      console.error("Failed to save store info:", err)
      setError("Failed to save store information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Store Information" : "Store Information"}</CardTitle>
          <CardDescription>Tell us about your business.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g., The Barber's Den"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, Anytown, USA"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your store and services."
              rows={4}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next
        </Button>
      </div>
    </form>
  )
}
