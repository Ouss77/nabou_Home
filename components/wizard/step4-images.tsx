"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ImageIcon } from "lucide-react"
import { ImageUpload } from "../image-upload"
import type { StoreImage } from "@/lib/db"

interface Step4ImagesProps {
  storeId: string
  onFinish: () => void
  onBack: () => void
}

export function Step4Images({ storeId, onFinish, onBack }: Step4ImagesProps) {
  const [images, setImages] = useState<StoreImage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchImages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/barber/store-images?storeId=${storeId}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Failed to fetch images", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [storeId])

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
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Store Images
          </CardTitle>
          <CardDescription>Upload a logo and some gallery images to show off your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload storeId={storeId} images={images} onImagesChange={fetchImages} />
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onFinish}>
          Finish
        </Button>
      </div>
    </div>
  )
}
