"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Star, ArrowLeft, Loader2, AlertCircle, ImageIcon, User } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency-utils"

interface Store {
  id: string
  title: string
  address: string
  description: string | null
  slug: string
  barber_id: string
  barber_name: string
  image_url: string | null
  created_at: string
  updated_at: string
}

interface Service {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
  created_at: string
}

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

interface BookingPageProps {
  storeSlug: string
}

export function BookingPage({ storeSlug }: BookingPageProps) {
  const { toast } = useToast()

  // State for store data
  const [store, setStore] = useState<Store | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [storeImages, setStoreImages] = useState<StoreImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for booking form
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Client information
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientAge, setClientAge] = useState("")
  const [notes, setNotes] = useState("")

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch store data on component mount
  useEffect(() => {
    fetchStoreData()
  }, [storeSlug])

  // Fetch available slots when service and date are selected
  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedService, selectedDate])

  const fetchStoreData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch store details
      const storeResponse = await fetch(`/api/stores/${storeSlug}`)
      if (!storeResponse.ok) {
        throw new Error("Store not found")
      }
      const storeData = await storeResponse.json()
      setStore(storeData)

      // Fetch services
      const servicesResponse = await fetch(`/api/stores/${storeData.id}/services`)
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData.services || [])
      }

      // Fetch store images
      const imagesResponse = await fetch(`/api/stores/${storeData.id}/images`)
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json()
        setStoreImages(imagesData.images || [])
      }
    } catch (error) {
      console.error("Error fetching store data:", error)
      setError("Unable to load store information. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!store || !selectedService || !selectedDate) return

    try {
      setLoadingSlots(true)
      const selectedServiceData = services.find((s) => s.id === selectedService)
      const duration = selectedServiceData?.duration_minutes || 30

      const response = await fetch(
        `/api/bookings/available-slots?storeId=${store.id}&date=${selectedDate}&duration=${duration}`,
      )

      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.slots || [])
      } else {
        setAvailableSlots([])
      }
    } catch (error) {
      console.error("Error fetching available slots:", error)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!store || !selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: store.id,
          serviceId: selectedService,
          clientName,
          clientEmail,
          clientPhone,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          notes,
          age: clientAge ? Number.parseInt(clientAge) : undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Booking Confirmed!",
          description: "Your appointment has been successfully booked. You'll receive a confirmation email shortly.",
        })

        // Reset form
        setSelectedService("")
        setSelectedDate("")
        setSelectedTime("")
        setClientName("")
        setClientEmail("")
        setClientPhone("")
        setClientAge("")
        setNotes("")
        setAvailableSlots([])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to book appointment")
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return maxDate.toISOString().split("T")[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading store information...</p>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Store not found"}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const primaryImage = storeImages.find((img) => img.is_primary) || storeImages[0]
  const selectedServiceData = services.find((s) => s.id === selectedService)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{store.title}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {store.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Store Information */}
          <div className="space-y-6">
            {/* Store Images */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video overflow-hidden rounded-t-lg bg-gray-100">
                  {primaryImage ? (
                    <img
                      src={`data:${primaryImage.image_type};base64,${primaryImage.image_data}`}
                      alt={store.title}
                      className="w-full h-full object-cover"
                    />
                  ) : store.image_url ? (
                    <img
                      src={store.image_url || "/placeholder.svg"}
                      alt={store.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{store.title}</h2>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span>Barber: {store.barber_name}</span>
                    </div>
                  </div>
                  {store.description && <p className="text-gray-600 mt-4">{store.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Our Services
                </CardTitle>
                <CardDescription>Choose from our professional services</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No services available at this time.</p>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedService === service.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            {service.description && <p className="text-gray-600 text-sm mt-1">{service.description}</p>}
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {service.duration_minutes} min
                              </Badge>
                              <span className="font-semibold text-blue-600">{formatCurrency(service.price)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Store Images */}
            {storeImages.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {storeImages.map((image) => (
                      <div key={image.id} className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={`data:${image.image_type};base64,${image.image_data}`}
                          alt={image.image_name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Form */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Your Appointment
                </CardTitle>
                <CardDescription>Fill in your details to schedule your appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {/* Service Selection */}
                  <div>
                    <Label htmlFor="service">Service *</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{service.name}</span>
                              <span className="ml-2 text-sm text-gray-500">{formatCurrency(service.price)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="mt-1"
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    {loadingSlots ? (
                      <div className="mt-1 p-3 border rounded-md flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading available times...
                      </div>
                    ) : availableSlots.length === 0 && selectedDate ? (
                      <div className="mt-1 p-3 border rounded-md text-center text-gray-500">
                        No available time slots for this date
                      </div>
                    ) : (
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Client Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-gray-900">Your Information</h3>

                    <div>
                      <Label htmlFor="clientName">Full Name *</Label>
                      <Input
                        id="clientName"
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="mt-1"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientEmail">Email *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="mt-1"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientPhone">Phone Number</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="mt-1"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientAge">Age</Label>
                      <Input
                        id="clientAge"
                        type="number"
                        value={clientAge}
                        onChange={(e) => setClientAge(e.target.value)}
                        className="mt-1"
                        placeholder="25"
                        min="1"
                        max="120"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1"
                        placeholder="Any special requests or notes..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Booking Summary */}
                  {selectedServiceData && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span className="font-medium">{selectedServiceData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{selectedServiceData.duration_minutes} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-medium">{formatCurrency(selectedServiceData.price)}</span>
                        </div>
                        {selectedDate && (
                          <div className="flex justify-between">
                            <span>Date:</span>
                            <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {selectedTime && (
                          <div className="flex justify-between">
                            <span>Time:</span>
                            <span className="font-medium">{selectedTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || !selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        Book Appointment
                        <Calendar className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
