"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Clock, ArrowLeft } from "lucide-react"

interface Step4WorkingHoursProps {
  storeId: string
  onNext: () => void
  onBack: () => void
}

interface WorkingHours {
  day_of_week: number
  start_time: string
  end_time: string
  is_closed: boolean
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", shortLabel: "Sun" },
  { value: 1, label: "Monday", shortLabel: "Mon" },
  { value: 2, label: "Tuesday", shortLabel: "Tue" },
  { value: 3, label: "Wednesday", shortLabel: "Wed" },
  { value: 4, label: "Thursday", shortLabel: "Thu" },
  { value: 5, label: "Friday", shortLabel: "Fri" },
  { value: 6, label: "Saturday", shortLabel: "Sat" },
]

const DEFAULT_WORKING_HOURS: WorkingHours[] = [
  { day_of_week: 0, start_time: "10:00", end_time: "18:00", is_closed: true }, // Sunday
  { day_of_week: 1, start_time: "09:00", end_time: "18:00", is_closed: false }, // Monday
  { day_of_week: 2, start_time: "09:00", end_time: "18:00", is_closed: false }, // Tuesday
  { day_of_week: 3, start_time: "09:00", end_time: "18:00", is_closed: false }, // Wednesday
  { day_of_week: 4, start_time: "09:00", end_time: "18:00", is_closed: false }, // Thursday
  { day_of_week: 5, start_time: "09:00", end_time: "18:00", is_closed: false }, // Friday
  { day_of_week: 6, start_time: "09:00", end_time: "17:00", is_closed: false }, // Saturday
]

export function Step4WorkingHours({ storeId, onNext, onBack }: Step4WorkingHoursProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(DEFAULT_WORKING_HOURS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const updateWorkingHour = (dayOfWeek: number, field: keyof WorkingHours, value: string | boolean) => {
    setWorkingHours((prev) => prev.map((wh) => (wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh)))
  }

  const handleContinue = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/barber/working-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, workingHours }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save working hours")
      }

      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save working hours")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Set Your Working Hours</h2>
        <p className="text-muted-foreground">
          Define when you're available for appointments. Customers can only book during these hours.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayHours = workingHours.find((wh) => wh.day_of_week === day.value) || {
                day_of_week: day.value,
                start_time: "09:00",
                end_time: "18:00",
                is_closed: false,
              }

              return (
                <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-24 font-medium">{day.label}</div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!dayHours.is_closed}
                      onCheckedChange={(checked) => updateWorkingHour(day.value, "is_closed", !checked)}
                    />
                    <span className="text-sm text-muted-foreground w-12">{dayHours.is_closed ? "Closed" : "Open"}</span>
                  </div>

                  {!dayHours.is_closed && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={dayHours.start_time}
                        onChange={(e) => updateWorkingHour(day.value, "start_time", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={dayHours.end_time}
                        onChange={(e) => updateWorkingHour(day.value, "end_time", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={loading} className="min-w-[120px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </div>
    </div>
  )
}
