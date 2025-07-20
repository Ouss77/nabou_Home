"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Phone, Mail, Clock, Star, ExternalLink, Calendar, X, ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"

interface LandingPageData {
  id: string
  store_id: string
  bio: string
  specialties: string[]
  experience_years: number
  social_links: {
    instagram?: string
    facebook?: string
    twitter?: string
    website?: string
  }
  booking_link: string
  phone: string
  email: string
  created_at: string
  updated_at: string
}

interface Store {
  id: string
  title: string
  address: string
  description: string | null
  slug: string
  barber_name: string
}

interface Service {
  id: string
  name: string
  description: string | null
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
  image_type: string
  is_primary: boolean
}

interface BarberLandingPageProps {
  slug: string
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function BarberLandingPage({ slug }: BarberLandingPageProps) {
  const [store, setStore] = useState<Store | null>(null)
  const [landingData, setLandingData] = useState<LandingPageData | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [images, setImages] = useState<StoreImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    fetchStoreData()
  }, [slug])

  const fetchStoreData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch store data
      const storeResponse = await fetch(`/api/stores?slug=${slug}`)
      if (!storeResponse.ok) {
        throw new Error("Store not found")
      }
      const storeData = await storeResponse.json()
      setStore(storeData)

      // Fetch landing page data
      const landingResponse = await fetch(`/api/barber/landing-page?store_id=${storeData.id}`)
      if (landingResponse.ok) {
        const landingPageData = await landingResponse.json()
        setLandingData(landingPageData)
      }

      // Fetch services
      const servicesResponse = await fetch(`/api/stores/${storeData.id}/services`)
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData)
      }

      // Fetch working hours
      const hoursResponse = await fetch(`/api/barber/working-hours?store_id=${storeData.id}`)
      if (hoursResponse.ok) {
        const hoursData = await hoursResponse.json()
        setWorkingHours(hoursData)
      }

      // Fetch images
      const imagesResponse = await fetch(`/api/stores/${storeData.id}/images`)
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json()
        setImages(imagesData.images || [])
      }
    } catch (error) {
      console.error("Error fetching store data:", error)
      setError(error instanceof Error ? error.message : "Failed to load store data")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatWorkingHours = (hours: WorkingHours[]) => {
    return hours.map((hour) => ({
      day: dayNames[hour.day_of_week],
      time: hour.is_closed ? "Closed" : `${hour.start_time} - ${hour.end_time}`,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading barber profile...</p>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The requested barber profile could not be found."}</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const thumbnailImages = images.filter((img) => !img.is_primary).slice(0, 7)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <span className="text-white font-bold text-sm">BB</span>
              </div>
              <span className="text-xl font-bold text-gray-800">BarberBook</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/stores">
                <Button variant="outline">All Stores</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">Shop Products</Button>
              </Link>
              <Link href={`/book/${store.slug}`}>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
              <AvatarImage
                src={primaryImage ? `data:${primaryImage.image_type};base64,${primaryImage.image_data}` : undefined}
              />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                {store.barber_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{store.barber_name}</h1>
            <h2 className="text-2xl text-gray-600 mb-4">{store.title}</h2>
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <MapPin className="h-5 w-5" />
              <span>{store.address}</span>
            </div>
            {landingData?.experience_years && (
              <Badge variant="secondary" className="text-sm">
                {landingData.experience_years} years of experience
              </Badge>
            )}
          </div>
        </div>

        {/* About Section */}
        {landingData?.bio && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                About {store.barber_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">{landingData.bio}</p>
              {landingData.specialties && landingData.specialties.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Specialties:</h4>
                  <div className="flex flex-wrap gap-2">
                    {landingData.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Gallery Section */}
        {images.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Gallery
                </span>
                {images.length > 8 && (
                  <Button variant="outline" size="sm" onClick={() => setShowGallery(true)}>
                    View All ({images.length})
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Main Featured Image */}
                {primaryImage && (
                  <div className="relative group cursor-pointer" onClick={() => setShowGallery(true)}>
                    <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={`data:${primaryImage.image_type};base64,${primaryImage.image_data}`}
                        alt={primaryImage.image_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-600 text-white">Featured Photo</Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg" />
                  </div>
                )}

                {/* Thumbnail Grid */}
                {thumbnailImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {thumbnailImages.map((image) => (
                      <div
                        key={image.id}
                        className="relative group cursor-pointer"
                        onClick={() => setShowGallery(true)}
                      >
                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={`data:${image.image_type};base64,${image.image_data}`}
                            alt={image.image_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg" />
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">{image.image_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {images.length <= 8 && images.length > 1 && (
                  <div className="text-center">
                    <Button variant="outline" onClick={() => setShowGallery(true)} className="mt-4">
                      View All Photos ({images.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Services & Pricing</CardTitle>
            <CardDescription>Professional services offered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    <span className="font-bold text-blue-600">{formatCurrency(service.price)}</span>
                  </div>
                  {service.description && <p className="text-sm text-gray-600 mb-2">{service.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{service.duration_minutes} minutes</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Working Hours & Contact */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formatWorkingHours(workingHours).map((hour, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{hour.day}</span>
                    <span className={`font-medium ${hour.time === "Closed" ? "text-red-600" : "text-gray-900"}`}>
                      {hour.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {landingData?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a href={`tel:${landingData.phone}`} className="text-blue-600 hover:underline">
                    {landingData.phone}
                  </a>
                </div>
              )}
              {landingData?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a href={`mailto:${landingData.email}`} className="text-blue-600 hover:underline">
                    {landingData.email}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">{store.address}</span>
              </div>

              {/* Social Links */}
              {landingData?.social_links && Object.keys(landingData.social_links).length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Follow Us</h4>
                  <div className="flex gap-3">
                    {landingData.social_links.instagram && (
                      <a
                        href={landingData.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                      >
                        Instagram
                      </a>
                    )}
                    {landingData.social_links.facebook && (
                      <a
                        href={landingData.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Facebook
                      </a>
                    )}
                    {landingData.social_links.website && (
                      <a
                        href={landingData.social_links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                      >
                        Website <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="text-center">
          <CardContent className="py-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Book Your Appointment?</h3>
            <p className="text-gray-600 mb-6">Experience professional barbering services with {store.barber_name}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/book/${store.slug}`}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Button>
              </Link>
              {landingData?.booking_link && (
                <a href={landingData.booking_link} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    External Booking
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full-Screen Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
            <h3 className="text-white text-lg font-semibold">
              {store.barber_name}'s Gallery ({images.length} photos)
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGallery(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Gallery Grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-900">
                    <img
                      src={`data:${image.image_type};base64,${image.image_data}`}
                      alt={image.image_name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {image.is_primary && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-600 text-white">Featured</Badge>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/70 text-white text-sm px-2 py-1 rounded">{image.image_name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
