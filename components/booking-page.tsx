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
import { Scissors, MapPin, Clock, Star, Loader2, ChevronLeft, ChevronRight, AlertTriangle, Images } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { LanguageSelector } from "@/components/language-selector"
import { ImageGallery } from "@/components/image-gallery"
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
  const { t } = useLanguage()
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
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [passedTimes, setPassedTimes] = useState<string[]>([])
  const [fetchingSlots, setFetchingSlots] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [storeImages, setStoreImages] = useState<StoreImage[]>([])
  const [showGallery, setShowGallery] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)

  const prevSelectedDateRef = useRef<Date | null>(null)
  const lastFetchTimeRef = useRef<number>(0)

  // Static time slots - moved outside to prevent recreation
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ]

  // Fetch store images
  useEffect(() => {
    fetchStoreImages()
  }, [store.id])

  const fetchStoreImages = async () => {
    setLoadingImages(true)
    try {
      const response = await fetch(`/api/stores/${store.id}/images`)
      const data = await response.json()
      if (response.ok) {
        setStoreImages(data.images || [])
      }
    } catch (error) {
      console.error("Failed to fetch store images:", error)
    } finally {
      setLoadingImages(false)
    }
  }

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Memoized function to fetch booked times
  const fetchBookedTimes = useCallback(async () => {
    if (!selectedDate || !store.id) {
      setBookedTimes([])
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
        console.log("[FetchBookedTimes] Fetching for date:", dateString)
      }

      const params = new URLSearchParams({
        storeId: store.id,
        date: dateString,
        timezone: getTimezoneName(),
        clientTime: currentTime.toISOString(),
      })

      const response = await fetch(`/api/bookings/available-slots?${params}`)
      const data = await response.json()

      if (response.ok) {
        setBookedTimes(data.bookedTimes || [])
      } else {
        console.error("[FetchBookedTimes] Failed to fetch booked times:", data.error)
        setBookedTimes([])
      }
    } catch (err) {
      console.error("[FetchBookedTimes] Error fetching booked times:", err)
      setBookedTimes([])
    } finally {
      setFetchingSlots(false)
    }
  }, [selectedDate, store.id, currentTime])

  // Centralized effect to calculate and set passedTimes
  useEffect(() => {
    if (!selectedDate) {
      setPassedTimes([])
      return
    }

    const dateString = formatDateToString(selectedDate)
    const todayString = getCurrentDateString()
    const comparison = compareDateStrings(dateString, todayString)

    // Debug logging to help troubleshoot
    if (process.env.NODE_ENV === "development") {
      console.log("[PassedTimesEffect] Date comparison:", {
        selectedDate: dateString,
        today: todayString,
        comparison,
        isToday: comparison === 0,
        isFuture: comparison > 0,
        isPast: comparison < 0,
      })
    }

    let newPassedTimes: string[] = []
    if (comparison > 0) {
      // Future date (including tomorrow)
      newPassedTimes = []
    } else if (comparison < 0) {
      // Past date
      newPassedTimes = [...timeSlots]
    } else {
      // Today
      newPassedTimes = getPassedTimeSlots(dateString, timeSlots)
    }

    setPassedTimes(newPassedTimes)
  }, [selectedDate, currentTime]) // Removed timeSlots from dependencies

  // Effect to clear selectedTime if it becomes passed
  useEffect(() => {
    if (selectedTime && passedTimes.includes(selectedTime)) {
      setSelectedTime("")
    }
  }, [selectedTime, passedTimes])

  // Effect to clear selectedTime if it becomes booked
  useEffect(() => {
    if (selectedTime && bookedTimes.includes(selectedTime)) {
      setSelectedTime("")
    }
  }, [selectedTime, bookedTimes])

  // Effect for when selectedDate changes
  useEffect(() => {
    const hasDateChanged = prevSelectedDateRef.current?.getTime() !== selectedDate?.getTime()

    if (hasDateChanged || !prevSelectedDateRef.current) {
      if (process.env.NODE_ENV === "development") {
        debugDateInfo(selectedDate)
      }

      prevSelectedDateRef.current = selectedDate
      setSelectedTime("") // Clear selected time when date changes
      fetchBookedTimes()
    }
  }, [selectedDate, fetchBookedTimes])

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

    // Re-check if selected time is booked or passed
    if (bookedTimes.includes(selectedTime)) {
      setError(t.booking.noLongerAvailable)
      fetchBookedTimes()
      return
    }
    if (passedTimes.includes(selectedTime)) {
      setError(t.booking.alreadyPassed)
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
          fetchBookedTimes()
        } else if (response.status === 400 && data.error && data.error.toLowerCase().includes("past")) {
          setError(data.error || t.booking.cannotBookPast)
          fetchBookedTimes()
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
      if (!isDateInPast(currentDateObj)) {
        daysArray.push(currentDateObj)
      } else {
        daysArray.push(null)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">{t.booking.bookingConfirmed}</CardTitle>
            <CardDescription>{t.booking.confirmationEmail}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>{t.booking.service}:</strong> {selectedService?.name}
              </p>
              <p>
                <strong>{t.booking.date}:</strong> {selectedDate ? formatDateForDisplay(selectedDate) : ""}
              </p>
              <p>
                <strong>{t.booking.time}:</strong> {selectedTime}
              </p>
              <p>
                <strong>{t.booking.duration}:</strong> {selectedService?.duration_minutes} {t.booking.minutes}
              </p>
              <p>
                <strong>{t.booking.price}:</strong> ${selectedService?.price}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scissors className="h-8 w-8 text-slate-800" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{store.title}</h1>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>{store.address}</span>
                </div>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={displayImage || "/placeholder.svg"}
                    alt={store.title}
                    width={500}
                    height={300}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  {storeImages.length > 1 && (
                    <Button
                      onClick={() => setShowGallery(true)}
                      className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white"
                      size="sm"
                    >
                      <Images className="h-4 w-4 mr-2" />
                      Show More Images ({storeImages.length})
                    </Button>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">
                    {t.booking.about} {store.title}
                  </h2>
                  <p className="text-slate-600">{store.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.booking.ourServices}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedService?.id === service.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-slate-600">{service.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {service.duration_minutes} {t.common.min}
                            </span>
                          </div>
                        </div>
                        <div className="text-lg font-bold">${service.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t.booking.bookAppointment}</CardTitle>
                <CardDescription>{t.booking.selectPreferred}</CardDescription>
                {selectedDate && isToday(selectedDate) && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <div>
                      {t.booking.currentTime}:{" "}
                      {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({getTimezoneName()})
                    </div>
                  </div>
                )}
              </CardHeader>
              {selectedDate && (
                <div className="px-6 pt-2 pb-0">
                  <div className="p-2 bg-blue-50 rounded-md text-blue-800 text-sm flex items-center justify-between">
                    <div>
                      <span className="font-medium">{t.booking.selectedDate}: </span>
                      {formatDateForDisplay(selectedDate)}
                    </div>
                    <div className="flex gap-2">
                      {isToday(selectedDate) ? (
                        <Badge variant="outline" className="bg-blue-100">
                          {t.booking.today}
                        </Badge>
                      ) : isTomorrow(formatDateToString(selectedDate)) ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {t.booking.tomorrow}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {t.booking.futureDate}
                        </Badge>
                      )}
                      {process.env.NODE_ENV === "development" && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                          {t.booking.passed}: {passedTimes.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <CardContent className="pt-6">
                <form onSubmit={handleBooking} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {selectedService && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{selectedService.name}</h4>
                          <p className="text-sm text-slate-600">
                            {selectedService.duration_minutes} {t.booking.minutes}
                          </p>
                        </div>
                        <Badge>${selectedService.price}</Badge>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{t.booking.selectDate}</Label>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            {t.calendar.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                          </h3>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={navigateToPreviousMonth}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={navigateToNextMonth}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {t.calendar.days.map((day) => (
                            <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
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
                                  className={`w-full h-full text-sm rounded-md transition-colors ${
                                    selectedDate && day.toDateString() === selectedDate.toDateString()
                                      ? "bg-blue-500 text-white"
                                      : "hover:bg-slate-100"
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

                  {selectedDate && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{t.booking.selectTime}</Label>
                        {fetchingSlots && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {t.booking.checking}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.map((time) => {
                          const isBooked = bookedTimes.includes(time)
                          const isPassed = passedTimes.includes(time)
                          const isSelected = selectedTime === time
                          const isDisabled = isBooked || isPassed || fetchingSlots

                          let buttonText = time
                          let variant: "default" | "secondary" | "outline" | "destructive" = "outline"

                          if (isSelected) variant = "default"
                          else if (isBooked) {
                            buttonText = t.booking.booked
                            variant = "secondary"
                          } else if (isPassed) {
                            buttonText = t.booking.passed
                            variant = "destructive"
                          }

                          return (
                            <Button
                              key={time}
                              type="button"
                              variant={variant}
                              size="sm"
                              onClick={() => !isDisabled && setSelectedTime(time)}
                              disabled={isDisabled}
                              className={`${isDisabled ? "opacity-70 cursor-not-allowed" : ""} ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                            >
                              {buttonText}
                            </Button>
                          )
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1 pt-1">
                        {bookedTimes.length > 0 && <p>{t.booking.grayBooked}</p>}
                        {passedTimes.length > 0 && <p>{t.booking.redPassed}</p>}
                        {process.env.NODE_ENV === "development" && (
                          <p>
                            {t.booking.debug}: {t.booking.today}={getCurrentDateString()}, Selected=
                            {selectedDate ? formatDateToString(selectedDate) : "none"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">{t.booking.fullName}</Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                        placeholder={t.booking.yourFullName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">{t.auth.email}</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        required
                        placeholder={t.booking.yourEmail}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">{t.booking.phoneOptional}</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder={t.booking.yourPhone}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder={"insert your age"}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t.booking.additionalNotes}</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.booking.specialRequests}
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !selectedService || !selectedDate || !selectedTime || fetchingSlots}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.booking.bookAppointment}
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
