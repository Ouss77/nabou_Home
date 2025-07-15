"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, XCircle, CheckCircle2, Trash2 } from "lucide-react"
import Image from "next/image"
import { addStoreImage, deleteStoreImage, getStoreImages, setPrimaryStoreImage } from "@/lib/db"
import type { Store } from "@/lib/db" // Import Store type
import { Label, Input } from "@/components/ui/input" // Import Label and Input components

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

interface Step4ImagesProps {
  storeId: string
  onFinish: (store: Store) => void
  onBack: () => void
  initialData: Store // Declare initialData variable
}

export function Step4Images({ storeId, onFinish, onBack, initialData }: Step4ImagesProps) {
  const [storeImages, setStoreImages] = useState<StoreImage[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true)
      try {
        const images = await getStoreImages(storeId)
        setStoreImages(images)
      } catch (error) {
        console.error("Failed to fetch store images", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchImages()
  }, [storeId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "gallery") => {
    setUploadError(null)
    if (e.target.files && e.target.files.length > 0) {
      if (type === "logo") {
        setLogoFile(e.target.files[0])
      } else {
        setGalleryFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
      }
    }
  }

  const uploadImage = async (file: File, isPrimary: boolean) => {
    return new Promise<StoreImage>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(",")[1]
        if (!base64data) {
          reject(new Error("Failed to read file as base64"))
          return
        }

        try {
          const newImage = await addStoreImage(storeId, base64data, file.name, file.type, file.size, isPrimary)
          resolve(newImage)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const handleUploadAll = async () => {
    setIsUploading(true)
    setUploadError(null)
    try {
      const uploaded: StoreImage[] = []

      if (logoFile) {
        const logo = await uploadImage(logoFile, true)
        uploaded.push(logo)
      }

      for (const file of galleryFiles) {
        const image = await uploadImage(file, false)
        uploaded.push(image)
      }

      setStoreImages((prev) => [...prev, ...uploaded])
      setLogoFile(null)
      setGalleryFiles([])
    } catch (error) {
      console.error("Error uploading images:", error)
      setUploadError("Failed to upload images. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteStoreImage(imageId)
      setStoreImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (error) {
      console.error("Failed to delete image", error)
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      await setPrimaryStoreImage(storeId, imageId)
      setStoreImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        })),
      )
    } catch (error) {
      console.error("Failed to set primary image", error)
    }
  }

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
          <CardTitle>Store Images</CardTitle>
          <CardDescription>Upload your store logo and gallery images.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Store Logo (Primary Image)</Label>
            <Input id="logo-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} />
            {logoFile && (
              <div className="mt-2 flex items-center gap-2">
                <Image
                  src={URL.createObjectURL(logoFile) || "/placeholder.svg"}
                  alt="Logo preview"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <span className="text-sm text-muted-foreground">{logoFile.name}</span>
              </div>
            )}
            {storeImages.find((img) => img.is_primary) && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-medium">Current Logo:</span>
                <Image
                  src={`data:${storeImages.find((img) => img.is_primary)?.image_type};base64,${storeImages.find((img) => img.is_primary)?.image_data}`}
                  alt="Current Logo"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md object-cover"
                />
              </div>
            )}
          </div>

          {/* Gallery Images Upload */}
          <div className="space-y-2">
            <Label htmlFor="gallery-upload">Gallery Images</Label>
            <Input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, "gallery")}
            />
            <div className="mt-2 grid grid-cols-3 gap-4">
              {galleryFiles.map((file, index) => (
                <div key={index} className="relative">
                  <Image
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={`Gallery preview ${index}`}
                    width={100}
                    height={100}
                    className="h-24 w-full rounded-md object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                    onClick={() => setGalleryFiles((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {(logoFile || galleryFiles.length > 0) && (
            <Button onClick={handleUploadAll} disabled={isUploading} className="w-full">
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Selected Images
            </Button>
          )}

          {/* Existing Images Display */}
          {storeImages.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Uploaded Images</h3>
              <div className="grid grid-cols-3 gap-4">
                {storeImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <Image
                      src={`data:${image.image_type};base64,${image.image_data}`}
                      alt={image.image_name}
                      width={100}
                      height={100}
                      className="h-24 w-full rounded-md object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {!image.is_primary && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleSetPrimary(image.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {image.is_primary && (
                      <span className="absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        Logo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={() => onFinish(initialData)} disabled={isUploading}>
          Finish
        </Button>
      </div>
    </div>
  )
}
