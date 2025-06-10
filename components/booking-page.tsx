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

  // Use refs to track previous values and prevent unnecessary updates
  const prevSelectedDateRef = useRef<Date | null>(null)
  const prevSelectedTimeRef = useRef<string>("")
  const lastFetchTimeRef = useRef<number>(0)

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
  ]

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date())
    }

    // Update immediately
    updateTime()

    // Then update every minute
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  // Function to fetch booked times - memoized with useCallback
  const fetchBookedTimes = useCallback(async () => {
    if (!selectedDate || !store.id) {
      setBookedTimes([])
      setPassedTimes([])
      return
    }

    // Prevent too frequent API calls
    const now = Date.now()
    if (now - lastFetchTimeRef.current < 5000) {
      return // Don't fetch if last fetch was less than 5 seconds ago
    }
    lastFetchTimeRef.current = now

    setFetchingSlots(true)
    try {
      const dateString = selectedDate.toISOString().split("T")[0]
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

        // Calculate passed times on client side
        const clientPassedTimes = getPassedTimeSlots(dateString, timeSlots)
        setPassedTimes(clientPassedTimes)

        // Clear selected time if it's now booked or passed
        const currentSelectedTime = prevSelectedTimeRef.current
        if (
          currentSelectedTime &&
          (data.bookedTimes.includes(currentSelectedTime) || clientPassedTimes.includes(currentSelectedTime))
        ) {
          setSelectedTime("")
          prevSelectedTimeRef.current = ""
        }
      } else {
        console.error("Failed to fetch booked times:", data.error)
        setBookedTimes([])
        setPassedTimes([])
      }
    } catch (err) {
      console.error("Error fetching booked times:", err)
      setBookedTimes([])
      setPassedTimes([])
    } finally {
      setFetchingSlots(false)
    }
  }, [selectedDate, store.id, currentTime, timeSlots])

  // Update passed times when current time changes (only for today)
  useEffect(() => {
    if (selectedDate && isToday(selectedDate)) {
      const dateString = getCurrentDateString()
      const newPassedTimes = getPassedTimeSlots(dateString, timeSlots)

      // Only update if passed times actually changed
      setPassedTimes((prevPassedTimes) => {
        const hasChanged = JSON.stringify(prevPassedTimes) !== JSON.stringify(newPassedTimes)
        if (hasChanged) {
          // Clear selected time if it has passed
          const currentSelectedTime = prevSelectedTimeRef.current
          if (currentSelectedTime && newPassedTimes.includes(currentSelectedTime)) {
            setSelectedTime("")
            prevSelectedTimeRef.current = ""
          }
          return newPassedTimes
        }
        return prevPassedTimes
      })
    }
  }, [currentTime, selectedDate, timeSlots])

  // Fetch booked times when selectedDate changes
  useEffect(() => {
    const dateChanged = prevSelectedDateRef.current?.getTime() !== selectedDate?.getTime()

    if (dateChanged) {
      prevSelectedDateRef.current = selectedDate
      fetchBookedTimes()
    }
  }, [selectedDate, fetchBookedTimes])

  // Track selected time changes
  useEffect(() => {
    prevSelectedTimeRef.current = selectedTime
  }, [selectedTime])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService || !selectedDate || !selectedTime) {
      setError("Please select a service, date, and time")
      return
    }

    const dateString = selectedDate.toISOString().split("T")[0]

    // Client-side validation for past appointments
    if (isDateTimePast(dateString, selectedTime)) {
      setError("This time slot has already passed. Please select a future time.")
      return
    }

    // Check if selected time is booked (client-side validation)
    if (bookedTimes.includes(selectedTime)) {
      setError("This time slot is no longer available. Please select a different time.")
      return
    }

    // Check if selected time has passed (client-side validation)
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
          clientDateTime: currentTime.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific conflict errors
        if (response.status === 409) {
          setError(data.error || "This time slot is no longer available. Please select a different time.")
          // Reset fetch timer to allow immediate refresh
          lastFetchTimeRef.current = 0
          await fetchBookedTimes()
        } else if (response.status === 400 && data.error.includes("past")) {
          setError(data.error || "Cannot book appointments in the past. Please select a future time.")
          // Reset fetch timer to allow immediate refresh
          lastFetchTimeRef.current = 0
          await fetchBookedTimes()
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

  // Calendar implementation with proper timezone handling
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)

      // Don't normalize the date for comparison - use isDateInPast instead
      if (!isDateInPast(date)) {
        days.push(date)
      } else {
        days.push(null)
      }
    }

    return days
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
      {/* Header */}
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
          {/* Store Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <Image
                  src={store.image_url || "/placeholder.svg?height=300&width=500&query=modern barbershop interior"}
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

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Book Your Appointment</CardTitle>
                <CardDescription>Select your preferred service, date, and time</CardDescription>
                {selectedDate && isToday(selectedDate) && (
                  <div className="text-sm text-muted-foreground">
                    <div>
                      Current time: {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div>Timezone: {getTimezoneName()}</div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
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
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newMonth = new Date(currentMonth)
                                newMonth.setMonth(newMonth.getMonth() - 1)
                                setCurrentMonth(newMonth)
                              }}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newMonth = new Date(currentMonth)
                                newMonth.setMonth(newMonth.getMonth() + 1)
                                setCurrentMonth(newMonth)
                              }}
                            >
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
                                      : "hover:bg-gray-100"
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
                            Checking availability...
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => {
                          const isBooked = bookedTimes.includes(time)
                          const isPassed = passedTimes.includes(time)
                          const isSelected = selectedTime === time
                          const isDisabled = isBooked || isPassed || fetchingSlots

                          let buttonText = time
                          let variant: "default" | "secondary" | "outline" | "destructive" = "outline"

                          if (isSelected) {
                            variant = "default"
                          } else if (isBooked) {
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
                              className={`${isDisabled ? "opacity-70 cursor-not-allowed" : ""} ${
                                isSelected ? "ring-2 ring-blue-500" : ""
                              }`}
                            >
                              {buttonText}
                            </Button>
                          )
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {bookedTimes.length > 0 && <p>• Gray slots are already booked</p>}
                        {passedTimes.length > 0 && <p>• Red slots have already passed</p>}
                        {selectedDate && isToday(selectedDate) && (
                          <p>• Time slots update automatically based on your local time</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="clientPhone">Phone Number</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (optional)</Label>
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
