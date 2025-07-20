"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Scissors,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Images,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

interface WorkingHours {
  day_of_week: number
  start_time: string
  end_time: string
  is_closed: boolean
}

interface StoreImage {
  id: string
  image_data: string
  image_name: string
  is_primary: boolean
}

interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  website?: string
}

interface LandingPageData {
  bio?: string
  specialties?: string[]
  experience_years?: number
  social_links?: SocialLinks
  external_booking_links?: Array<{
    platform: string
    url: string
    label: string
  }>
  testimonials?: Array<{
    name: string
    rating: number
    comment: string
  }>
}

interface BarberLandingPageProps {
  store: {
    id: string
    title: string
    address: string
    description: string
    barber_name: string
    slug: string
  }
  services: Service[]
  workingHours: WorkingHours[]
  images: StoreImage[]
  landingPageData?: LandingPageData
}

export function BarberLandingPage({
  store,
  services,
  workingHours,
  images,
  landingPageData = {},
}: BarberLandingPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const galleryImages = images.filter((img) => !img.is_primary)
  const allImages = images

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    setIsZoomed(false)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    setIsZoomed(false)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const getDayName = (dayIndex: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayIndex]
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:gap-3 transition-all">
              <Scissors className="h-6 w-6 text-slate-800" />
              <span className="text-xl font-bold text-slate-800">BarberBook</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/profile/${store.slug}`}>
                  <Globe className="h-4 w-4 mr-2" />
                  My Profile
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/book/${store.slug}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Image Gallery */}
      <section className="relative bg-gradient-to-r from-slate-900 to-slate-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        {primaryImage && (
          <div className="absolute inset-0">
            <Image
              src={`data:${primaryImage.image_name.split(".").pop()};base64,${primaryImage.image_data}`}
              alt={store.title}
              fill
              className="object-cover opacity-30"
            />
          </div>
        )}
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Scissors className="h-8 w-8" />
              <span className="text-sm font-medium tracking-wide uppercase">Professional Barber</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{store.barber_name}</h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-6">{store.title}</p>
            {landingPageData.bio && (
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">{landingPageData.bio}</p>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
                  {images.slice(0, 4).map((image, index) => (
                    <div
                      key={image.id}
                      className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        setCurrentImageIndex(index)
                        setShowGallery(true)
                      }}
                    >
                      <Image
                        src={`data:${image.image_name.split(".").pop()};base64,${image.image_data}`}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === 3 && images.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="text-white text-center">
                            <Images className="h-6 w-6 mx-auto mb-1" />
                            <span className="text-sm font-medium">+{images.length - 4} more</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {images.length > 4 && (
                  <Button
                    variant="outline"
                    className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setShowGallery(true)}
                  >
                    <Images className="h-4 w-4 mr-2" />
                    View All Photos ({images.length})
                  </Button>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-slate-100">
                <Link href={`/book/${store.slug}`}>
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Appointment
                </Link>
              </Button>
              {landingPageData.external_booking_links?.map((link, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white text-white hover:bg-white hover:text-slate-900 bg-transparent"
                >
                  <Link href={link.url} target="_blank">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    {link.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
              <div className="text-white">
                <h3 className="text-lg font-semibold">{allImages[currentImageIndex]?.image_name}</h3>
                <p className="text-sm text-white/70">
                  {currentImageIndex + 1} of {allImages.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleZoom} className="text-white hover:bg-white/20">
                  {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGallery(false)}
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
                  src={`data:${allImages[currentImageIndex]?.image_name.split(".").pop()};base64,${allImages[currentImageIndex]?.image_data}`}
                  alt={allImages[currentImageIndex]?.image_name}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  priority
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-40"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-40"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Vertical Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 max-h-96 overflow-y-auto">
                <div className="flex flex-col gap-2 p-2 bg-black/30 rounded-lg backdrop-blur-sm">
                  {allImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => {
                        setCurrentImageIndex(index)
                        setIsZoomed(false)
                      }}
                      className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? "border-white scale-110" : "border-white/30 hover:border-white/60"
                      }`}
                    >
                      <Image
                        src={`data:${image.image_name.split(".").pop()};base64,${image.image_data}`}
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

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">About {store.barber_name}</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-600 mb-4">{store.description}</p>
                      {landingPageData.experience_years && (
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium">{landingPageData.experience_years} years of experience</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-slate-500" />
                        <span>{store.address}</span>
                      </div>
                    </div>
                    {landingPageData.specialties && landingPageData.specialties.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Specialties</h3>
                        <div className="flex flex-wrap gap-2">
                          {landingPageData.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Services Section - Reduced Size */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Services & Pricing</h2>
              <div className="grid gap-3">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">{service.name}</h3>
                          <p className="text-slate-600 text-sm mb-2">{service.description}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration_minutes} minutes</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-slate-900">{formatPrice(service.price)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Testimonials Section */}
            {landingPageData.testimonials && landingPageData.testimonials.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">What Clients Say</h2>
                <div className="grid gap-6">
                  {landingPageData.testimonials.map((testimonial, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating ? "text-yellow-500 fill-current" : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-600 mb-3">"{testimonial.comment}"</p>
                        <p className="font-medium text-slate-900">- {testimonial.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Book Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Book Your Appointment</h3>
                <Button size="lg" className="w-full mb-4" asChild>
                  <Link href={`/book/${store.slug}`}>
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Now
                  </Link>
                </Button>
                {landingPageData.external_booking_links?.map((link, index) => (
                  <Button key={index} variant="outline" size="lg" className="w-full mb-2 bg-transparent" asChild>
                    <Link href={link.url} target="_blank">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Working Hours
                </h3>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const dayHours = workingHours.find((wh) => wh.day_of_week === dayIndex)
                    return (
                      <div key={dayIndex} className="flex justify-between items-center py-1">
                        <span className="font-medium">{getDayName(dayIndex)}</span>
                        <span className="text-slate-600">
                          {dayHours?.is_closed
                            ? "Closed"
                            : `${dayHours?.start_time || "09:00"} - ${dayHours?.end_time || "18:00"}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact & Social */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Connect With Me</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-500" />
                    <span className="text-sm">{store.address}</span>
                  </div>

                  {landingPageData.social_links && (
                    <>
                      <Separator />
                      <div className="flex gap-3">
                        {landingPageData.social_links.instagram && (
                          <Button variant="outline" size="icon" asChild>
                            <Link href={landingPageData.social_links.instagram} target="_blank">
                              <Instagram className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {landingPageData.social_links.facebook && (
                          <Button variant="outline" size="icon" asChild>
                            <Link href={landingPageData.social_links.facebook} target="_blank">
                              <Facebook className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {landingPageData.social_links.twitter && (
                          <Button variant="outline" size="icon" asChild>
                            <Link href={landingPageData.social_links.twitter} target="_blank">
                              <Twitter className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {landingPageData.social_links.website && (
                          <Button variant="outline" size="icon" asChild>
                            <Link href={landingPageData.social_links.website} target="_blank">
                              <Globe className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
