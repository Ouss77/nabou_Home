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
import { Scissors, MapPin, Clock, Star, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import Image from "next/image"
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

interface BookingPageProps {
  store: Store
  services: Service[]
}

export function BookingPage({ store, services }: BookingPageProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [clientName, setClientName] = useState("")
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

  const prevSelectedDateRef = useRef<Date | null>(null)
  const lastFetchTimeRef = useRef<number>(0)

  // Static time slots - moved outside to prevent recreation
  const timeSlots = [
    "09:00", "09:30",
    "10:00", "10:30",
    "11:00", "11:30",
    "12:00", "12:30",
    "13:00", "13:30",
    "14:00", "14:30",
    "15:00", "15:30",
    "16:00", "16:30",
    "17:00", "17:30",
  ]

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
      setError("Please select a service, date, and time")
      return
    }

    const dateString = formatDateToString(selectedDate)

    // Client-side validation for past appointments
    if (isDateTimePast(dateString, selectedTime)) {
      setError("This time slot has already passed. Please select a future time.")
      return
    }

    // Re-check if selected time is booked or passed
    if (bookedTimes.includes(selectedTime)) {
      setError("This time slot is no longer available. Please select a different time.")
      fetchBookedTimes()
      return
    }
    if (passedTimes.includes(selectedTime)) {
      setError("This time slot has already passed. Please select a future time.")
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
          clientTimezone: getTimezoneName(),
          clientDateTime: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409 || (data.error && data.error.toLowerCase().includes("booked"))) {
          setError(data.error || "This time slot was just booked. Please select a different time.")
          fetchBookedTimes()
        } else if (response.status === 400 && data.error && data.error.toLowerCase().includes("past")) {
          setError(data.error || "Cannot book appointments in the past. Please select a future time.")
          fetchBookedTimes()
        } else {
          throw new Error(data.error || "Failed to book appointment")
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book appointment")
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
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your appointment has been successfully booked. You will receive a confirmation email shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Service:</strong> {selectedService?.name}
              </p>
              <p>
                <strong>Date:</strong> {selectedDate ? formatDateForDisplay(selectedDate) : ""}
              </p>
              <p>
                <strong>Time:</strong> {selectedTime}
              </p>
              <p>
                <strong>Duration:</strong> {selectedService?.duration_minutes} minutes
              </p>
              <p>
                <strong>Price:</strong> ${selectedService?.price}
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <Image
                  src={store.image_url || "/placeholder.svg?height=300&width=500&query=modern+barbershop+interior"}
                  alt={store.title}
                  width={500}
                  height={300}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">About {store.title}</h2>
                  <p className="text-slate-600">{store.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
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
                            <span className="text-sm text-slate-600">{service.duration_minutes} min</span>
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
                <CardTitle>Book Your Appointment</CardTitle>
                <CardDescription>Select your preferred service, date, and time</CardDescription>
                {selectedDate && isToday(selectedDate) && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <div>
                      Current time: {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
                      {getTimezoneName()})
                    </div>
                  </div>
                )}
              </CardHeader>
              {selectedDate && (
                <div className="px-6 pt-2 pb-0">
                  <div className="p-2 bg-blue-50 rounded-md text-blue-800 text-sm flex items-center justify-between">
                    <div>
                      <span className="font-medium">Selected date: </span>
                      {formatDateForDisplay(selectedDate)}
                    </div>
                    <div className="flex gap-2">
                      {isToday(selectedDate) ? (
                        <Badge variant="outline" className="bg-blue-100">
                          Today
                        </Badge>
                      ) : isTomorrow(formatDateToString(selectedDate)) ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Tomorrow
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Future Date
                        </Badge>
                      )}
                      {process.env.NODE_ENV === "development" && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                          Passed: {passedTimes.length}
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
                          <p className="text-sm text-slate-600">{selectedService.duration_minutes} minutes</p>
                        </div>
                        <Badge>${selectedService.price}</Badge>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
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
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
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
                        <Label>Select Time</Label>
                        {fetchingSlots && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Checking...
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
                            buttonText = "Booked"
                            variant = "secondary"
                          } else if (isPassed) {
                            buttonText = "Passed"
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
                        {bookedTimes.length > 0 && <p>• Gray slots are booked.</p>}
                        {passedTimes.length > 0 && <p>• Red slots have passed.</p>}
                        {process.env.NODE_ENV === "development" && (
                          <p>
                            • Debug: Today={getCurrentDateString()}, Selected=
                            {selectedDate ? formatDateToString(selectedDate) : "none"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Full Name</Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Phone Number (Optional)</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or notes..."
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !selectedService || !selectedDate || !selectedTime || fetchingSlots}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Book Appointment
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
