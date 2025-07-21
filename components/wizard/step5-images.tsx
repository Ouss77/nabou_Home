"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { Camera, Upload, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch existing images
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

  const handleImageUpload = async (imageData: string, imageName: string, imageType: string, imageSize: number) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/barber/store-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          imageData,
          imageName,
          imageType,
          imageSize,
          isPrimary: images.length === 0, // First image is primary
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setImages((prev) => [...prev, result.image])
        toast({
          title: "Image Uploaded",
          description: "Your image has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast({
        title: "Error",
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
          description: "Image has been removed from your store.",
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

  const handleSetPrimary = async (imageId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/barber/store-images/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      })

      if (response.ok) {
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_primary: img.id === imageId,
          })),
        )
        toast({
          title: "Primary Image Set",
          description: "This image is now your main store image.",
        })
      }
    } catch (error) {
      console.error("Failed to set primary image:", error)
      toast({
        title: "Error",
        description: "Failed to set primary image. Please try again.",
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
        <h2 className="text-xl font-semibold mb-2">Add Your Photos</h2>
        <p className="text-muted-foreground">
          Showcase your work and space with high-quality photos. This helps customers know what to expect.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Add photos of your work, your space, or anything that represents your business. The first image will be your
            main photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageUpload={handleImageUpload}
            disabled={isLoading}
            maxImages={10}
            currentImageCount={images.length}
          />
        </CardContent>
      </Card>

      {/* Current Images */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Images ({images.length})</CardTitle>
            <CardDescription>Manage your uploaded images. Click the star to set as main image.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={`data:image/jpeg;base64,${image.image_data}`}
                      alt={image.image_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Image Controls */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant={image.is_primary ? "default" : "secondary"}
                      onClick={() => handleSetPrimary(image.id)}
                      disabled={isLoading || image.is_primary}
                    >
                      <Star className={`h-4 w-4 ${image.is_primary ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </div>

                  {/* Primary Badge */}
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Photo Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use high-quality, well-lit photos</li>
            <li>• Show your best work and clean workspace</li>
            <li>• Include before/after shots if applicable</li>
            <li>• Make sure images are clear and professional</li>
            <li>• The first image will be your main store photo</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onFinish}>{images.length > 0 ? "Complete Setup" : "Skip Images & Complete"}</Button>
      </div>
    </div>
  )
}
