"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react"
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

interface ImageGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: StoreImage[]
  initialIndex?: number
}

export function ImageGallery({ open, onOpenChange, images, initialIndex = 0 }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return

      switch (event.key) {
        case "ArrowLeft":
          goToPrevious()
          break
        case "ArrowRight":
          goToNext()
          break
        case "Escape":
          onOpenChange(false)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, currentIndex])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setIsZoomed(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  if (images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white">
              <h3 className="text-lg font-semibold">{currentImage.image_name}</h3>
              <p className="text-sm text-white/70">
                {currentIndex + 1} of {images.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleZoom} className="text-white hover:bg-white/20">
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-20">
            <div className={`relative transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}>
              <Image
                src={`data:${currentImage.image_type};base64,${currentImage.image_data}`}
                alt={currentImage.image_name}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
                priority
              />
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-40"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-40"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center justify-center gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      setCurrentIndex(index)
                      setIsZoomed(false)
                    }}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex ? "border-white scale-110" : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    <Image
                      src={`data:${image.image_type};base64,${image.image_data}`}
                      alt={image.image_name}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
