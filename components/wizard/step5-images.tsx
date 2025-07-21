"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Camera } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/image-upload"

interface StoreImage {
  id: string
  image_data: string
  image_name: string
  is_primary: boolean
}

interface Step5ImagesProps {
  storeId: string
  onFinish: () => void
  onBack: () => void
}

export function Step5Images({ storeId, onFinish, onBack }: Step5ImagesProps) {
  const [images, setImages] = useState<StoreImage[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchImages()
  }, [storeId])

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/barber/store-images?storeId=${storeId}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Failed to fetch images:", error)
    }
  }

  const handleImagesChange = () => {
    fetchImages() // Refresh images if needed
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/barber/store-images/${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId))
        toast({
          title: "Image Deleted",
          description: "Image has been removed from your store.",
        })
      }
    } catch (error) {
      console.error("Failed to delete image:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add Your Photos</h2>
        <p className="text-muted-foreground">
          Showcase your work and space with photos. This helps customers know what to expect.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photo Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload storeId={storeId} images={images} onImagesChange={handleImagesChange} />
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Photo Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload high-quality photos of your work</li>
          <li>• Include photos of your workspace or salon</li>
          <li>• Show before/after examples if applicable</li>
          <li>• Make sure photos are well-lit and clear</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onFinish} className="min-w-[120px]">
          Finish Setup
        </Button>
      </div>
    </div>
  )
}
