"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Clock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { ImageUpload } from "@/components/image-upload"

interface Store {
  id: string
  title: string
  address: string
  description: string
  image_url: string
}

interface StoreImage {
  id: string
  store_id: string
  image_data: string
  image_name: string
  image_type: string
  image_size: number
  is_primary: boolean
  created_at: string
}

interface WorkingHours {
  day_of_week: number
  start_time: string
  end_time: string
  is_closed: boolean
}

type StoreSetupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: Store | null
  onSuccess: () => void
  defaultTab?: "basic" | "images" | "hours"
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", shortLabel: "Sun" },
  { value: 1, label: "Monday", shortLabel: "Mon" },
  { value: 2, label: "Tuesday", shortLabel: "Tue" },
  { value: 3, label: "Wednesday", shortLabel: "Wed" },
  { value: 4, label: "Thursday", shortLabel: "Thu" },
  { value: 5, label: "Friday", shortLabel: "Fri" },
  { value: 6, label: "Saturday", shortLabel: "Sat" },
]

const DEFAULT_WORKING_HOURS: WorkingHours[] = [
  { day_of_week: 0, start_time: "10:00", end_time: "18:00", is_closed: true }, // Sunday
  { day_of_week: 1, start_time: "09:00", end_time: "18:00", is_closed: false }, // Monday
  { day_of_week: 2, start_time: "09:00", end_time: "18:00", is_closed: false }, // Tuesday
  { day_of_week: 3, start_time: "09:00", end_time: "18:00", is_closed: false }, // Wednesday
  { day_of_week: 4, start_time: "09:00", end_time: "18:00", is_closed: false }, // Thursday
  { day_of_week: 5, start_time: "09:00", end_time: "18:00", is_closed: false }, // Friday
  { day_of_week: 6, start_time: "09:00", end_time: "17:00", is_closed: false }, // Saturday
]

export function StoreSetupDialog({ open, onOpenChange, store, onSuccess, defaultTab }: StoreSetupDialogProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState(store?.title || "")
  const [address, setAddress] = useState(store?.address || "")
  const [description, setDescription] = useState(store?.description || "")
  const [imageUrl, setImageUrl] = useState(store?.image_url || "")
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(DEFAULT_WORKING_HOURS)
  const [storeImages, setStoreImages] = useState<StoreImage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingWorkingHours, setLoadingWorkingHours] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [error, setError] = useState("")

  // Load existing working hours and images when editing a store
  useEffect(() => {
    if (store?.id && open) {
      fetchWorkingHours()
      fetchStoreImages()
    }
  }, [store?.id, open])

  const fetchWorkingHours = async () => {
    if (!store?.id) return

    setLoadingWorkingHours(true)
    try {
      const response = await fetch(`/api/barber/working-hours?storeId=${store.id}`)
      const data = await response.json()

      if (response.ok && data.workingHours?.length > 0) {
        setWorkingHours(data.workingHours)
      } else {
        setWorkingHours(DEFAULT_WORKING_HOURS)
      }
    } catch (error) {
      console.error("Failed to fetch working hours:", error)
      setWorkingHours(DEFAULT_WORKING_HOURS)
    } finally {
      setLoadingWorkingHours(false)
    }
  }

  const fetchStoreImages = async () => {
    if (!store?.id) return

    setLoadingImages(true)
    try {
      const response = await fetch(`/api/barber/store-images?storeId=${store.id}`)
      const data = await response.json()

      if (response.ok) {
        setStoreImages(data.images || [])
      }
    } catch (error) {
      console.error("Failed to fetch store images:", error)
    } finally {
      setLoadingImages(false)
    }
  }

  const updateWorkingHour = (dayOfWeek: number, field: keyof WorkingHours, value: string | boolean) => {
    setWorkingHours((prev) => prev.map((wh) => (wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let storeId = store?.id

      // First, create or update the store
      if (!store) {
        // Creating new store
        const storeResponse = await fetch("/api/barber/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, address, description, imageUrl }),
        })

        const storeData = await storeResponse.json()

        if (!storeResponse.ok) {
          throw new Error(storeData.error || "Failed to create store")
        }

        storeId = storeData.store.id
      } else {
        // Updating existing store
        const storeResponse = await fetch(`/api/barber/store/${store.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, address, description, imageUrl }),
        })

        const storeData = await storeResponse.json()

        if (!storeResponse.ok) {
          throw new Error(storeData.error || "Failed to update store")
        }
      }

      // Then, save working hours
      if (storeId) {
        const workingHoursResponse = await fetch("/api/barber/working-hours", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId, workingHours }),
        })

        const workingHoursData = await workingHoursResponse.json()

        if (!workingHoursResponse.ok) {
          console.error("Working hours error:", workingHoursData)
          throw new Error(workingHoursData.error || "Failed to save working hours")
        }
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      console.error("Store setup error:", err)
      setError(err instanceof Error ? err.message : "Failed to save store")
    } finally {
      setLoading(false)
    }
  }

  // Reset form when dialog opens for new store
  useEffect(() => {
    if (open && !store) {
      setWorkingHours(DEFAULT_WORKING_HOURS)
      setStoreImages([])
      setTitle("")
      setAddress("")
      setDescription("")
      setImageUrl("")
    }
  }, [open, store])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{store ? t.store.editStore : t.store.createStore}</DialogTitle>
          <DialogDescription>{store ? t.store.updateInformation : t.store.setupProfile}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={defaultTab || "basic"} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="hours">Working Hours</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label htmlFor="imageUrl">{t.store.imageUrl} (Legacy)</Label>
                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder={t.store.exampleUrl}
                    />
                    <p className="text-xs text-muted-foreground">
                      This field is kept for backward compatibility. Use the Images tab for better image management.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              {store?.id ? (
                <ImageUpload storeId={store.id} images={storeImages} onImagesChange={fetchStoreImages} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Please save the store information first to upload images.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="hours" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Working Hours
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Set your business hours for each day of the week. Customers can only book appointments during these
                    hours.
                  </p>
                </CardHeader>
                <CardContent>
                  {loadingWorkingHours ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {DAYS_OF_WEEK.map((day) => {
                        const dayHours = workingHours.find((wh) => wh.day_of_week === day.value) || {
                          day_of_week: day.value,
                          start_time: "09:00",
                          end_time: "18:00",
                          is_closed: false,
                        }

                        return (
                          <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-20 font-medium">{day.label}</div>

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={!dayHours.is_closed}
                                onCheckedChange={(checked) => updateWorkingHour(day.value, "is_closed", !checked)}
                              />
                              <span className="text-sm text-muted-foreground">
                                {dayHours.is_closed ? "Closed" : "Open"}
                              </span>
                            </div>

                            {!dayHours.is_closed && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={dayHours.start_time}
                                  onChange={(e) => updateWorkingHour(day.value, "start_time", e.target.value)}
                                  className="w-32"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                  type="time"
                                  value={dayHours.end_time}
                                  onChange={(e) => updateWorkingHour(day.value, "end_time", e.target.value)}
                                  className="w-32"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {"Cancel"}
            </Button>
            <Button type="submit" disabled={loading || loadingWorkingHours}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {store ? "update": "create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
