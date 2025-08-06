"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface StoreImage {
  id: string
  image_data: string
  image_name: string
  is_primary: boolean
}

interface Step4ImagesProps {
  storeId: string
  onFinish: () => void
  onBack: () => void
}

export function Step5Images({ storeId, onFinish, onBack }: Step4ImagesProps) {
  const [images, setImages] = useState<StoreImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
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

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  setIsUploading(true)

  const uploads = Array.from(files).map((file, idx) => {
    return new Promise<void>((resolve) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large", 
          description: `${file.name} is too large. Please choose files under 5MB.`,
          variant: "destructive",
        })
        return resolve()
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string

          // ✅ Prevent double base64 prefix issue
          if (!imageData.startsWith("data:image")) {
            throw new Error("Invalid base64 image data")
          }

          const base64WithoutPrefix = imageData.split(",")[1]

          const response = await fetch("/api/barber/store-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storeId,
              imageData: base64WithoutPrefix,
              imageName: file.name,
              imageType: file.type,
              imageSize: file.size,
              isPrimary: images.length === 0 && idx === 0,
            }),
          })

          if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}`)
          }
        } catch (err) {
          console.error("Failed to upload image:", err)
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}.`,
            variant: "destructive",
          })
        }

        resolve()
      }

      reader.readAsDataURL(file)
    })
  })

  await Promise.all(uploads)
    await fetchImages() // ✅ Refresh the image list here

  setIsUploading(false)
  event.target.value = ""
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
      <div className="text-center">
        <ImageIcon className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Add Store Images</h2>
        <p className="text-muted-foreground">
          Upload photos of your barbershop to attract more customers. This step is optional.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Gallery</CardTitle>
          <CardDescription>
            Add photos of your barbershop, work examples, or team. The first image will be your main photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="max-h-[400px] overflow-y-auto">

          {/* Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center mb-6">
          <label className="relative block cursor-pointer border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent transition">

            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Upload Store Images</p>
              <p className="text-xs text-muted-foreground">Drag and drop files here, or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports: JPG, PNG, WebP (Max 5MB each)</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            </label>

            {isUploading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
              </div>
            )}
          </div>
          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                  src={image.image_data.startsWith("data:image") ? image.image_data : `data:image/jpeg;base64,${image.image_data}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Main Photo
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && !isUploading && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No images uploaded yet</p>
              <p className="text-sm">Add some photos to showcase your barbershop</p>
            </div>
          )}
        </div>
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
