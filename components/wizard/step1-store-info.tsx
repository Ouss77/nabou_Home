"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Store } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Step1StoreInfoProps {
  store: Store | null
  onSave: (data: Partial<Store>) => void
}

export function Step1StoreInfo({ store, onSave }: Step1StoreInfoProps) {
  const [title, setTitle] = useState(store?.title || "")
  const [address, setAddress] = useState(store?.address || "")
  const [description, setDescription] = useState(store?.description || "")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSave({ title, address, description })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Let's start with the basics. You can always change this later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Store Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., The Sharp Cut"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="e.g., 123 Main St, Anytown, USA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Tell your customers about your store."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button type="submit">Next</Button>
      </div>
    </form>
  )
}
