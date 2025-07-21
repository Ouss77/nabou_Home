"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "../image-upload"
import { Camera, Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Step5ImagesProps {
  storeId: string
  onFinish: () => void
  onBack: () => void
}

interface StoreImage {
  id: string
  image_url: string
  alt_text: string
}

export function Step5Images({ storeId, onFinish, onBack }: Step5ImagesProps) {
  const [images, setImages] = useState<StoreImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
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

  const handleImageUpload = async (imageUrl: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/barber/store-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          imageUrl,
          altText: "Store image",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setImages((prev) => [...prev, result.image])
        toast({
          title: "Image Added",
          description: "Your image has been uploaded successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/barber/store-images/${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId))
        toast({
          title: "Image Removed",
          description: "Image has been removed from your gallery.",
        })
      }
    } catch (error) {
      console.error("Failed to delete image:", error)
      toast({
        title: "Error",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Add Photos</h2>
        <p className="text-muted-foreground">
          Showcase your work and space with high-quality photos. This helps customers know what to expect.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
          <CardDescription>
            Add photos of your work, workspace, or team. High-quality images help attract more customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload onImageUpload={handleImageUpload} />
        </CardContent>
      </Card>

      {/* Current Images */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Gallery ({images.length})</CardTitle>
            <CardDescription>These images will be displayed on your store profile and booking page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.alt_text}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use good lighting and high-resolution images</li>
            <li>• Show your best work and clean workspace</li>
            <li>• Include before/after photos if applicable</li>
            <li>• Add photos of your team and equipment</li>
            <li>• Keep images professional and relevant</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onFinish}>Complete Setup</Button>
      </div>
    </div>
  )
}
