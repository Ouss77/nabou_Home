"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label" // Corrected import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Clock } from "lucide-react"

interface WorkingHours {
  day_of_week: number
  start_time: string
  end_time: string
  is_closed: boolean
}

interface Step3WorkingHoursProps {
  storeId: string
  onNext: () => void
  onBack: () => void
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DEFAULT_WORKING_HOURS: WorkingHours[] = DAYS_OF_WEEK.map((_, i) => ({
  day_of_week: i,
  start_time: "09:00",
  end_time: "18:00",
  is_closed: i === 0, // Sunday closed by default
}))

export function Step3WorkingHours({ storeId, onNext, onBack }: Step3WorkingHoursProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(DEFAULT_WORKING_HOURS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchWorkingHours = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/barber/working-hours?storeId=${storeId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.workingHours && data.workingHours.length > 0) {
            // Ensure all 7 days are present, fill with defaults if not
            const fetchedHoursMap = new Map(data.workingHours.map((wh: any) => [wh.day_of_week, wh]))
            const mergedHours = DEFAULT_WORKING_HOURS.map((defaultWh) =>
              fetchedHoursMap.has(defaultWh.day_of_week)
                ? {
                    ...fetchedHoursMap.get(defaultWh.day_of_week),
                    start_time: fetchedHoursMap.get(defaultWh.day_of_week).start_time.substring(0, 5), // Ensure HH:MM
                    end_time: fetchedHoursMap.get(defaultWh.day_of_week).end_time.substring(0, 5), // Ensure HH:MM
                  }
                : defaultWh,
            )
            setWorkingHours(mergedHours)
          }
        } else {
          console.error("Failed to fetch working hours:", response.statusText)
        }
      } catch (error) {
        console.error("Failed to fetch working hours", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWorkingHours()
  }, [storeId])

  const handleUpdate = (dayOfWeek: number, field: keyof WorkingHours, value: string | boolean) => {
    setWorkingHours((prev) => prev.map((wh) => (wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh)))
  }

  const handleSaveAndNext = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/barber/working-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, workingHours }),
      })
      if (!response.ok) throw new Error("Failed to save working hours")
      onNext()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours
          </CardTitle>
          <CardDescription>
            Set your weekly schedule. Customers can only book appointments during these hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day, index) => {
            const dayHours = workingHours.find((wh) => wh.day_of_week === index) || DEFAULT_WORKING_HOURS[index]
            return (
              <div key={index} className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
                <div className="w-24 font-medium">{day}</div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`closed-${index}`}
                    checked={!dayHours.is_closed}
                    onCheckedChange={(checked) => handleUpdate(index, "is_closed", !checked)}
                  />
                  <Label htmlFor={`closed-${index}`} className="text-sm text-muted-foreground">
                    {dayHours.is_closed ? "Closed" : "Open"}
                  </Label>
                </div>
                {!dayHours.is_closed && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="time"
                      value={dayHours.start_time}
                      onChange={(e) => handleUpdate(index, "start_time", e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={dayHours.end_time}
                      onChange={(e) => handleUpdate(index, "end_time", e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleSaveAndNext} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next
        </Button>
      </div>
    </div>
  )
}
