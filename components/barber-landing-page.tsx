"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const galleryImages = images.filter((img) => !img.is_primary)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
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
      {/* Hero Section */}
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
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Scissors className="h-8 w-8" />
              <span className="text-sm font-medium tracking-wide uppercase">Professional Barber</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{store.barber_name}</h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-8">{store.title}</p>
            {landingPageData.bio && (
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">{landingPageData.bio}</p>
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

            {/* Services Section */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Services & Pricing</h2>
              <div className="grid gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">{service.name}</h3>
                          <p className="text-slate-600 mb-2">{service.description}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            <span>{service.duration_minutes} minutes</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">{formatPrice(service.price)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Gallery Section */}
            {galleryImages.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Gallery</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="relative">
                      <div className="aspect-video relative rounded-lg overflow-hidden">
                        <Image
                          src={`data:${galleryImages[currentImageIndex]?.image_name.split(".").pop()};base64,${galleryImages[currentImageIndex]?.image_data}`}
                          alt={`Gallery image ${currentImageIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {galleryImages.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 overflow-x-auto">
                      {galleryImages.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex ? "border-slate-900" : "border-transparent"
                          }`}
                        >
                          <Image
                            src={`data:${image.image_name.split(".").pop()};base64,${image.image_data}`}
                            alt={`Thumbnail ${index + 1}`}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

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
