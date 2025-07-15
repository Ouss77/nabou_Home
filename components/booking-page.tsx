"use client"
import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Scissors,
  MapPin,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ImageIcon,
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Timer,
} from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { LanguageSelector } from "@/components/language-selector"
import { ImageGallery } from "@/components/image-gallery"
import { formatCurrency } from "@/lib/currency-utils"
import {
  isToday,
  formatDateForDisplay,
  getCurrentDateString,
  getPassedTimeSlots,
  isDateInPast,
  getTimezoneName,
  isDateTimePast,
  compareDateStrings,
  isTomorrow,
  formatDateToString,
  debugDateInfo,
} from "@/lib/time-utils"

interface Store {
  id: string
  title: string
  address: string
  description: string
  image_url: string
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
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
  store: Store
  services: Service[]
}

export function BookingPage({ store, services }: BookingPageProps) {
  const { t, language } = useLanguage()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [clientName, setClientName] = useState("")
  const [age, setAge] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([]) // Changed from bookedTimes
  const [passedTimes, setPassedTimes] = useState<string[]>([])
  const [fetchingSlots, setFetchingSlots] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [storeImages, setStoreImages] = useState<StoreImage[]>([])
  const [showGallery, setShowGallery] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)

  const prevSelectedDateRef = useRef<Date | null>(null)
  const lastFetchTimeRef = useRef<number>(0)

  // Fetch store images
  useEffect(() => {
    fetchStoreImages()
  }, [store.id])

  const fetchStoreImages = async () => {
    setLoadingImages(true)
    try {
      const response = await fetch(`/api/stores/${store.id}/images`)
      if (response.ok) {
        const data = await response.json()
        setStoreImages(data.images || [])
      } else {
        console.error("Failed to fetch store images:", response.status)
        setStoreImages([])
      }
    } catch (error) {
      console.error("Failed to fetch store images:", error)
      setStoreImages([])
    } finally {
      setLoadingImages(false)
    }
  }

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Memoized function to fetch available slots
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate || !store.id || !selectedService) {
      setAvailableSlots([])
      return
    }

    const now = Date.now()
    if (now - lastFetchTimeRef.current < 1000) {
      return
    }
    lastFetchTimeRef.current = now

    setFetchingSlots(true)
    try {
      const dateString = formatDateToString(selectedDate)

      if (process.env.NODE_ENV === "development") {
        console.log("[FetchAvailableSlots] Fetching for date:", dateString)
      }

      const params = new URLSearchParams({
        storeId: store.id,
        date: dateString,
        timezone: getTimezoneName(),
        clientTime: currentTime.toISOString(),
        serviceDuration: selectedService.duration_minutes.toString(), // Pass service duration
      })

      const response = await fetch(`/api/bookings/available-slots?${params}`)

      if (!response.ok) {
        console.error("[FetchAvailableSlots] API returned error:", response.status, response.statusText)
        setAvailableSlots([])
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[FetchAvailableSlots] Response is not JSON:", contentType)
        setAvailableSlots([])
        return
      }

      const data = await response.json()
      setAvailableSlots(data.availableSlots || []) // Use availableSlots from API
    } catch (err) {
      console.error("[FetchAvailableSlots] Error fetching available slots:", err)
      setAvailableSlots([])
    } finally {
      setFetchingSlots(false)
    }
  }, [selectedDate, store.id, currentTime, selectedService]) // Added selectedService to dependencies

  // Centralized effect to calculate and set passedTimes
  useEffect(() => {
    if (!selectedDate) {
      setPassedTimes([])
      return
    }

    const dateString = formatDateToString(selectedDate)
    const todayString = getCurrentDateString()
    const comparison = compareDateStrings(dateString, todayString)

    let newPassedTimes: string[] = []
    if (comparison > 0) {
      newPassedTimes = []
    } else if (comparison < 0) {
      // If it's a past date, all slots are "passed"
      // We need a list of all possible slots to mark them as passed
      // For now, let's assume a fixed set of all possible slots for this logic
      const allPossibleSlots = Array.from({ length: (20 - 9) * 2 + 1 }, (_, i) => {
        // 9:00 to 20:00 in 30 min intervals
        const hour = Math.floor(9 + i / 2)
        const minute = (i % 2) * 30
        return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      })
      newPassedTimes = allPossibleSlots
    } else {
      // Today
      newPassedTimes = getPassedTimeSlots(dateString, availableSlots.length > 0 ? availableSlots : []) // Pass availableSlots or an empty array
    }

    setPassedTimes(newPassedTimes)
  }, [selectedDate, currentTime, availableSlots]) // Added availableSlots to dependencies

  // Effect to clear selectedTime if it becomes passed
  useEffect(() => {
    if (selectedTime && passedTimes.includes(selectedTime)) {
      setSelectedTime("")
    }
  }, [selectedTime, passedTimes])

  // Effect for when selectedDate or selectedService changes
  useEffect(() => {
    const hasDateChanged = prevSelectedDateRef.current?.getTime() !== selectedDate?.getTime()

    if (hasDateChanged || !prevSelectedDateRef.current || selectedService) {
      // Trigger fetch if service changes
      if (process.env.NODE_ENV === "development") {
        debugDateInfo(selectedDate)
      }

      prevSelectedDateRef.current = selectedDate
      setSelectedTime("") // Clear selected time when date or service changes
      fetchAvailableSlots()
    }
  }, [selectedDate, selectedService, fetchAvailableSlots])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService || !selectedDate || !selectedTime) {
      setError(t.booking.selectService)
      return
    }

    const dateString = formatDateToString(selectedDate)

    // Client-side validation for past appointments
    if (isDateTimePast(dateString, selectedTime)) {
      setError(t.booking.pastTimeError)
      return
    }

    // Re-check if selected time is still available (not passed)
    if (passedTimes.includes(selectedTime)) {
      setError(t.booking.alreadyPassed)
      return
    }
    // Re-check if selected time is still available (not booked/blocked by API)
    if (!availableSlots.includes(selectedTime)) {
      setError(t.booking.noLongerAvailable)
      fetchAvailableSlots() // Re-fetch to get updated slots
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          serviceId: selectedService.id,
          clientName,
          clientEmail,
          clientPhone,
          appointmentDate: dateString,
          appointmentTime: selectedTime,
          notes,
          age,
          clientTimezone: getTimezoneName(),
          clientDateTime: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409 || (data.error && data.error.toLowerCase().includes("booked"))) {
          setError(data.error || t.booking.justBooked)
          fetchAvailableSlots()
        } else if (response.status === 400 && data.error && data.error.toLowerCase().includes("past")) {
          setError(data.error || t.booking.cannotBookPast)
          fetchAvailableSlots()
        } else {
          throw new Error(data.error || t.booking.failedToBook)
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.booking.failedToBook)
    } finally {
      setLoading(false)
    }
  }

  // Fixed calendar navigation functions
  const navigateToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() - 1)
      return newMonth
    })
  }

  const navigateToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() + 1)
      return newMonth
    })
  }

  const getDaysInMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const daysInMonthCount = lastDayOfMonth.getDate()
    const startingDayOfWeek = firstDayOfMonth.getDay()

    const daysArray = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null)
    }

    for (let day = 1; day <= daysInMonthCount; day++) {
      const currentDateObj = new Date(year, month, day)
      // Only allow selection of current or future dates
      if (!isDateInPast(currentDateObj)) {
        daysArray.push(currentDateObj)
      } else {
        daysArray.push(null) // Mark past dates as unselectable
      }
    }
    return daysArray
  }

  const days = getDaysInMonth(currentMonth)

  // Get primary image or fallback
  const primaryImage = storeImages.find((img) => img.is_primary) || storeImages[0]
  const displayImage = primaryImage
    ? `data:${primaryImage.image_type};base64,${primaryImage.image_data}`
    : store.image_url || "/placeholder.svg?height=300&width=500"

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-800 mb-2">{t.booking.bookingConfirmed}</CardTitle>
            <CardDescription className="text-slate-600 text-base">{t.booking.confirmationEmail}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-slate-600 font-medium">{t.booking.service}:</span>
                <span className="font-semibold text-slate-800">{selectedService?.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-slate-600 font-medium">{t.booking.date}:</span>
                <span className="font-semibold text-slate-800">
                  {selectedDate ? formatDateForDisplay(selectedDate) : ""}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-slate-600 font-medium">{t.booking.time}:</span>
                <span className="font-semibold text-slate-800">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-emerald-100">
                <span className="text-slate-600 font-medium">{t.booking.duration}:</span>
                <span className="font-semibold text-slate-800">
                  {selectedService?.duration_minutes} {t.booking.minutes}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">{t.booking.price}:</span>
                <span className="font-bold text-lg text-emerald-600">
                  {formatCurrency(selectedService?.price || 0, language)}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-4">
                We'll send you a confirmation email with all the details shortly.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Book Another Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl shadow-lg">
                <Scissors className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-1">{store.title}</h1>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{store.address}</span>
                </div>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Store Information Section */}
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={displayImage || "/placeholder.svg"}
                    alt={store.title}
                    width={500}
                    height={300}
                    className="w-full h-72 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  {storeImages.length > 1 && (
                    <Button
                      onClick={() => setShowGallery(true)}
                      className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white shadow-lg backdrop-blur-sm"
                      size="sm"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      View Gallery ({storeImages.length})
                    </Button>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-3 text-slate-800">
                    {t.booking.about} {store.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed">{store.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Services Section */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Scissors className="h-6 w-6 text-slate-600" />
                  {t.booking.ourServices}
                </CardTitle>
                <CardDescription className="text-slate-600">Choose the perfect service for your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`group p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedService?.id === service.id
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-slate-800">{service.name}</h3>
                            {selectedService?.id === service.id && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                          </div>
                          <p className="text-slate-600 mb-3 leading-relaxed">{service.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Clock className="h-4 w-4" />
                              <span>
                                {service.duration_minutes} {t.common.min}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-800">
                              {formatCurrency(service.price, language)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Booking Form */}
          <div>
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-slate-600" />
                  {t.booking.bookAppointment}
                </CardTitle>
                <CardDescription className="text-slate-600">{t.booking.selectPreferred}</CardDescription>
                {selectedDate && isToday(selectedDate) && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800 text-sm">
                      <Timer className="h-4 w-4" />
                      <span className="font-medium">
                        {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
                        {getTimezoneName()})
                      </span>
                    </div>
                  </div>
                )}
              </CardHeader>

              {/* Enhanced Date Selection Display */}
              {selectedDate && (
                <div className="px-6 pb-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <span className="text-sm font-medium text-blue-800">Selected Date</span>
                          <div className="font-bold text-blue-900">{formatDateForDisplay(selectedDate)}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isToday(selectedDate) ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t.booking.today}</Badge>
                        ) : isTomorrow(formatDateToString(selectedDate)) ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            {t.booking.tomorrow}
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-800 border-slate-200">{t.booking.futureDate}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <CardContent className="pt-2">
                <form onSubmit={handleBooking} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Enhanced Service Selection Display */}
                  {selectedService && (
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <div>
                            <h4 className="font-semibold text-emerald-900">{selectedService.name}</h4>
                            <p className="text-sm text-emerald-700">
                              {selectedService.duration_minutes} {t.booking.minutes}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-lg px-3 py-1">
                          {formatCurrency(selectedService.price, language)}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Calendar */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t.booking.selectDate}
                    </Label>
                    <Card className="border-slate-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg text-slate-800">
                            {t.calendar.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                          </h3>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={navigateToPreviousMonth}
                              className="hover:bg-slate-100 bg-transparent"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={navigateToNextMonth}
                              className="hover:bg-slate-100 bg-transparent"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-7 gap-1 mb-3">
                          {t.calendar.days.map((day) => (
                            <div
                              key={day}
                              className="p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide"
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {days.map((day, index) => (
                            <div key={index} className="aspect-square">
                              {day && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedDate(day)}
                                  className={`w-full h-full text-sm rounded-lg transition-all duration-200 font-medium ${
                                    selectedDate && day.toDateString() === selectedDate.toDateString()
                                      ? "bg-blue-500 text-white shadow-lg scale-105"
                                      : "hover:bg-slate-100 text-slate-700 hover:scale-105"
                                  }`}
                                >
                                  {day.getDate()}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Enhanced Time Slot Selection */}
                  {selectedDate &&
                    selectedService && ( // Only show time slots if service is selected
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {t.booking.selectTime}
                          </Label>
                          {fetchingSlots && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="font-medium">{t.booking.checking}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {availableSlots.length > 0 ? (
                            availableSlots.map((time) => {
                              const isPassed = passedTimes.includes(time)
                              const isSelected = selectedTime === time
                              const isDisabled = isPassed || fetchingSlots

                              return (
                                <Button
                                  key={time}
                                  type="button"
                                  onClick={() => !isDisabled && setSelectedTime(time)}
                                  disabled={isDisabled}
                                  className={`h-12 text-sm font-medium transition-all duration-200 ${
                                    isSelected
                                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-300"
                                      : isPassed
                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:scale-105"
                                  }`}
                                  variant={isSelected ? "default" : "outline"}
                                >
                                  <div className="flex flex-col items-center gap-1">
                                    <span>{time}</span>
                                    <div className="flex">{isPassed && <Timer className="h-3 w-3" />} </div>

                                    {!isDisabled && !isSelected && (
                                      <CheckCircle2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                    )}
                                  </div>
                                </Button>
                              )
                            })
                          ) : (
                            <p className="col-span-full text-center text-muted-foreground">
                              No available slots for this date or service.
                            </p>
                          )}
                        </div>

                        {/* Enhanced Legend */}
                        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                            Time Slot Legend
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-white border border-slate-200 rounded"></div>
                              <span className="text-slate-600">Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                              <span className="text-slate-600">Booked (Not shown by API)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                              <span className="text-slate-600">Past Time</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Enhanced Contact Information Form */}
                  <div className="space-y-4">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Your Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="clientName"
                            className="text-sm font-medium text-slate-700 flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            {t.booking.fullName}
                          </Label>
                          <Input
                            id="clientName"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            required
                            placeholder={t.booking.yourFullName}
                            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="clientEmail"
                            className="text-sm font-medium text-slate-700 flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            {t.auth.email}
                          </Label>
                          <Input
                            id="clientEmail"
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            required
                            placeholder={t.booking.yourEmail}
                            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="clientPhone"
                            className="text-sm font-medium text-slate-700 flex items-center gap-2"
                          >
                            <Phone className="h-4 w-4" />
                            {t.booking.phoneOptional}
                          </Label>
                          <Input
                            id="clientPhone"
                            type="tel"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder={t.booking.yourPhone}
                            required
                            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-sm font-medium text-slate-700">
                            Age
                          </Label>
                          <Input
                            id="age"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Your age"
                            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label htmlFor="notes" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {t.booking.additionalNotes}
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t.booking.specialRequests}
                          rows={3}
                          className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    disabled={loading || !selectedService || !selectedDate || !selectedTime || fetchingSlots}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        {t.booking.bookAppointment}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery open={showGallery} onOpenChange={setShowGallery} images={storeImages} initialIndex={0} />
    </div>
  )
}
