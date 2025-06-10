"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Appointment {
  id: string
  client_name: string
  client_email: string
  appointment_date: string
  appointment_time: string
  service_name: string
  status: string
}

interface AppointmentCalendarProps {
  appointments: Appointment[]
}

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  // Get calendar days for current month
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
      days.push(new Date(year, month, day))
    }

    return days
  }

  const days = getDaysInMonth(currentDate)
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

  const selectedDateAppointments = appointments.filter((apt) => {
    if (!selectedDate) return false
    const aptDate = new Date(apt.appointment_date)
    return aptDate.toDateString() === selectedDate.toDateString()
  })

  const hasAppointments = (date: Date) => {
    return appointments.some((apt) => {
      const aptDate = new Date(apt.appointment_date)
      return aptDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`w-full h-full p-1 text-sm rounded-md transition-colors ${
                        selectedDate && day.toDateString() === selectedDate.toDateString()
                          ? "bg-blue-500 text-white"
                          : hasAppointments(day)
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
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

      <div>
        <Card>
          <CardHeader>
            <CardTitle>{selectedDate ? selectedDate.toLocaleDateString() : "Select a date"}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateAppointments.length === 0 ? (
              <p className="text-muted-foreground">No appointments for this date</p>
            ) : (
              <div className="space-y-3">
                {selectedDateAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{appointment.client_name}</div>
                      <div className="text-sm text-muted-foreground">{appointment.service_name}</div>
                      <div className="text-sm text-muted-foreground">{appointment.appointment_time}</div>
                    </div>
                    <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
