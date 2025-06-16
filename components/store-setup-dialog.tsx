"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface Store {
  id: string
  title: string
  address: string
  description: string
  image_url: string
}

interface StoreSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: Store | null
  onSuccess: () => void
}

export function StoreSetupDialog({ open, onOpenChange, store, onSuccess }: StoreSetupDialogProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState(store?.title || "")
  const [address, setAddress] = useState(store?.address || "")
  const [description, setDescription] = useState(store?.description || "")
  const [imageUrl, setImageUrl] = useState(store?.image_url || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = store ? `/api/barber/store/${store.id}` : "/api/barber/store"
      const method = store ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, address, description, imageUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save store")
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save store")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{store ? t.store.editStore : t.store.createStore}</DialogTitle>
          <DialogDescription>{store ? t.store.updateInformation : t.store.setupProfile}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">{t.store.storeName}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={t.store.exampleName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t.store.address}</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder={t.store.exampleAddress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.store.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.store.tellClients}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">{t.store.imageUrl}</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t.store.exampleUrl}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.store.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {store ? t.store.update : t.store.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
