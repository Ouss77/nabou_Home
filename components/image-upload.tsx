"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Star, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

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

interface ImageUploadProps {
  storeId: string
  images: StoreImage[]
  onImagesChange: () => void
}

export function ImageUpload({ storeId, images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        await uploadImage(file, i === 0 && images.length === 0) // First image is primary if no images exist
      }
      onImagesChange()
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const uploadImage = async (file: File, isPrimary = false) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string
          const base64WithoutPrefix = base64Data.split(",")[1]

          const response = await fetch("/api/barber/store-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storeId,
              imageData: base64WithoutPrefix,
              imageName: file.name,
              imageType: file.type,
              imageSize: file.size,
              isPrimary,
            }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Failed to upload image")
          }

          resolve()
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  const deleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/barber/store-images/${imageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }

      onImagesChange()
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const setPrimaryImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/barber/store-images/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, action: "setPrimary" }),
      })

      if (!response.ok) {
        throw new Error("Failed to set primary image")
      }

      onImagesChange()
    } catch (error) {
      console.error("Set primary error:", error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Store Images
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload multiple images to showcase your barbershop. The first image will be used as the main cover photo.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Drop images here or click to upload</p>
          <p className="text-sm text-gray-500 mb-4">Supports JPEG, PNG, and WebP files up to 5MB each</p>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="mb-2">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square relative rounded-lg overflow-hidden border">
                  <Image
                    src={`data:${image.image_type};base64,${image.image_data}`}
                    alt={image.image_name}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimaryImage(image.id)}
                      disabled={image.is_primary}
                    >
                      <Star className={`h-4 w-4 ${image.is_primary ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteImage(image.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Primary Badge */}
                  {image.is_primary && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Primary
                    </Badge>
                  )}
                </div>

                {/* Image Info */}
                <div className="mt-2 text-xs text-gray-500">
                  <p className="truncate">{image.image_name}</p>
                  <p>{formatFileSize(image.image_size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No images uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
