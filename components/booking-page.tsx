"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, ImageIcon, ArrowLeft, Check, AlertCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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

interface StoreImage {
  id: string
  image_data: string
  image_name: string
  is_primary: boolean
}

interface BookingPageProps {
  storeSlug: string
}

export default function BookingPage({ storeSlug }: BookingPageProps) {
  const { toast } = useToast()
  const [store, setStore] = useState<Store | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [storeImages, setStoreImages] = useState<StoreImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    age: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate time slots (9 AM to 8 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const allTimeSlots = generateTimeSlots()

  useEffect(() => {
    fetchStoreData()
  }, [storeSlug])

  useEffect(() => {
    if (selectedDate && store) {
      fetchAvailableSlots()
    }
  }, [selectedDate, store])

  const fetchStoreData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch store data
      const storeResponse = await fetch(`/api/stores/${storeSlug}`)
      if (!storeResponse.ok) {
        if (storeResponse.status === 404) {
          setError("Store not found. Please check the URL or contact support.")
          return
        }
        throw new Error("Failed to fetch store data")
      }

      const storeData = await storeResponse.json()
      setStore(storeData)

      // Fetch services
      const servicesResponse = await fetch(`/api/stores/${storeData.id}/services`)
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData)
      }

      // Fetch store images
      const imagesResponse = await fetch(`/api/stores/${storeData.id}/images`)
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json()
        setStoreImages(imagesData)
      }
    } catch (error) {
      console.error("Error fetching store data:", error)
      setError("Unable to load store information. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!store || !selectedDate) return

    try {
      const response = await fetch(`/api/bookings/available-slots?storeId=${store.id}&date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setBookedSlots(data.bookedSlots || [])
        setAvailableSlots(allTimeSlots.filter((slot) => !data.bookedSlots?.includes(slot)))
      }
    } catch (error) {
      console.error("Error fetching available slots:", error)
      toast({
        title: "Error",
        description: "Failed to load available time slots.",
        variant: "destructive",
      })
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !selectedDate || !selectedTime || !store) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: store.id,
          serviceId: selectedService.id,
          clientName: bookingForm.clientName,
          clientEmail: bookingForm.clientEmail,
          clientPhone: bookingForm.clientPhone,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          notes: bookingForm.notes,
          age: bookingForm.age ? Number.parseInt(bookingForm.age) : null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Booking Confirmed!",
          description: "Your appointment has been successfully booked. You'll receive a confirmation email shortly.",
        })

        // Reset form
        setBookingForm({
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          age: "",
          notes: "",
        })
        setSelectedService(null)
        setSelectedDate("")
        setSelectedTime("")

        // Refresh available slots
        fetchAvailableSlots()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to book appointment")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30) // Allow booking up to 30 days in advance
    return maxDate.toISOString().split("T")[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Store not found</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Return to homepage
          </Link>
        </div>
      </div>
    )
  }

  const primaryImage = storeImages.find((img) => img.is_primary) || storeImages[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Store Information */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{store.title}</CardTitle>
                  {storeImages.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setShowImageGallery(true)}>
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Gallery
                    </Button>
                  )}
                </div>
                <CardDescription>by {store.barber_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {primaryImage && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${primaryImage.image_data}`}
                      alt={store.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{store.address}</span>
                </div>

                {store.description && <p className="text-sm text-gray-600">{store.description}</p>}

                {/* Booking Summary */}
                {selectedService && selectedDate && selectedTime && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Booking Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Service:</span>
                        <span className="font-medium">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Date:</span>
                        <span className="font-medium">{formatDate(selectedDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Time:</span>
                        <span className="font-medium">{formatTime(selectedTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Duration:</span>
                        <span className="font-medium">{selectedService.duration_minutes} min</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-1 mt-2">
                        <span className="text-blue-700 font-semibold">Price:</span>
                        <span className="font-bold">{formatPrice(selectedService.price)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleBooking} className="space-y-6">
              {/* Service Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    Select a Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {services.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No services available at this location.</p>
                  ) : (
                    <div className="grid gap-3">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedService?.id === service.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedService(service)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{service.name}</h3>
                                {selectedService?.id === service.id && <Check className="h-4 w-4 text-blue-600" />}
                              </div>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {service.duration_minutes} min
                                </Badge>
                                <span className="font-bold text-blue-600">{formatPrice(service.price)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Date & Time Selection */}
              {selectedService && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">2</span>
                      </div>
                      Select Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="date">Select Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value)
                          setSelectedTime("") // Reset time when date changes
                        }}
                        min={getTomorrowDate()}
                        max={getMaxDate()}
                        className="mt-1"
                        required
                      />
                    </div>

                    {selectedDate && (
                      <div>
                        <Label>Available Times for {formatDate(selectedDate)}</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              type="button"
                              variant={selectedTime === slot ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(slot)}
                              className="text-xs"
                            >
                              {formatTime(slot)}
                            </Button>
                          ))}
                        </div>
                        {availableSlots.length === 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            No available time slots for this date. Please select a different date.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Customer Information */}
              {selectedService && selectedDate && selectedTime && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">3</span>
                      </div>
                      Your Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientName">Full Name *</Label>
                        <Input
                          id="clientName"
                          type="text"
                          value={bookingForm.clientName}
                          onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                          required
                          className="mt-1"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={bookingForm.age}
                          onChange={(e) => setBookingForm({ ...bookingForm, age: e.target.value })}
                          className="mt-1"
                          placeholder="Your age"
                          min="1"
                          max="120"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clientEmail">Email Address *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={bookingForm.clientEmail}
                        onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientPhone">Phone Number</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={bookingForm.clientPhone}
                        onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                        className="mt-1"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Special Requests or Notes</Label>
                      <Textarea
                        id="notes"
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        className="mt-1"
                        placeholder="Any special requests or notes for your barber..."
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      {isSubmitting ? "Booking..." : <>Confirm Booking - {formatPrice(selectedService.price)}</>}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showImageGallery && storeImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{store.title} - Gallery</h3>
              <Button variant="outline" size="sm" onClick={() => setShowImageGallery(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {storeImages.map((image) => (
                <div key={image.id} className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={`data:image/jpeg;base64,${image.image_data}`}
                    alt={image.image_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
