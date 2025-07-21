"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Step4WorkingHoursProps {
  storeId: string
  onNext: () => void
  onBack: () => void
}

interface WorkingHours {
  day: string
  is_open: boolean
  open_time: string
  close_time: string
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

const TIME_OPTIONS = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
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
  "20:30",
  "21:00",
  "21:30",
  "22:00",
]

export function Step4WorkingHours({ storeId, onNext, onBack }: Step4WorkingHoursProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Initialize default working hours
  useEffect(() => {
    const defaultHours: WorkingHours[] = DAYS_OF_WEEK.map((day) => ({
      day: day.key,
      is_open: day.key !== "sunday", // Default: closed on Sunday
      open_time: "09:00",
      close_time: "18:00",
    }))
    setWorkingHours(defaultHours)
    fetchWorkingHours()
  }, [storeId])

  const fetchWorkingHours = async () => {
    try {
      const response = await fetch(`/api/barber/working-hours?storeId=${storeId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.workingHours && data.workingHours.length > 0) {
          setWorkingHours(data.workingHours)
        }
      }
    } catch (error) {
      console.error("Failed to fetch working hours:", error)
    }
  }

  const handleToggleDay = (dayKey: string, isOpen: boolean) => {
    setWorkingHours((prev) => prev.map((hour) => (hour.day === dayKey ? { ...hour, is_open: isOpen } : hour)))
  }

  const handleTimeChange = (dayKey: string, field: "open_time" | "close_time", value: string) => {
    setWorkingHours((prev) => prev.map((hour) => (hour.day === dayKey ? { ...hour, [field]: value } : hour)))
  }

  const handleSaveAndContinue = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/barber/working-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          workingHours,
        }),
      })

      if (response.ok) {
        toast({
          title: "Working Hours Saved",
          description: "Your business hours have been set successfully.",
        })
        onNext()
      } else {
        throw new Error("Failed to save working hours")
      }
    } catch (error) {
      console.error("Failed to save working hours:", error)
      toast({
        title: "Error",
        description: "Failed to save working hours. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyToAll = () => {
    const mondayHours = workingHours.find((h) => h.day === "monday")
    if (mondayHours) {
      setWorkingHours((prev) =>
        prev.map((hour) => ({
          ...hour,
          is_open: hour.day !== "sunday" ? mondayHours.is_open : false,
          open_time: mondayHours.open_time,
          close_time: mondayHours.close_time,
        })),
      )
      toast({
        title: "Hours Applied",
        description: "Monday's hours have been applied to all weekdays.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Set Your Working Hours</h2>
        <p className="text-muted-foreground">Define when customers can book appointments at your business.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>Set your operating hours for each day of the week.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Apply Button */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleApplyToAll}>
              Apply Monday to All Weekdays
            </Button>
          </div>

          {/* Working Hours for Each Day */}
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = workingHours.find((h) => h.day === day.key)
            if (!dayHours) return null

            return (
              <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-24">
                  <Label className="font-medium">{day.label}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={dayHours.is_open} onCheckedChange={(checked) => handleToggleDay(day.key, checked)} />
                  <Label className="text-sm text-muted-foreground">{dayHours.is_open ? "Open" : "Closed"}</Label>
                </div>

                {dayHours.is_open && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Select
                      value={dayHours.open_time}
                      onValueChange={(value) => handleTimeChange(day.key, "open_time", value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-muted-foreground">to</span>

                    <Select
                      value={dayHours.close_time}
                      onValueChange={(value) => handleTimeChange(day.key, "close_time", value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSaveAndContinue} disabled={isLoading}>
          {isLoading ? "Saving..." : "Continue to Images"}
        </Button>
      </div>
    </div>
  )
}
