"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
 
const DAYS = [
  { name: "Sunday", value: 0 },
  { name: "Monday", value: 1 },
  { name: "Tuesday", value: 2 },
  { name: "Wednesday", value: 3 },
  { name: "Thursday", value: 4 },
  { name: "Friday", value: 5 },
  { name: "Saturday", value: 6 },
]

const DEFAULT_HOURS: WorkingHours[] = [
  { day_of_week: 0, start_time: "10:00", end_time: "16:00", is_closed: true }, // Sunday - closed
  { day_of_week: 1, start_time: "09:00", end_time: "18:00", is_closed: false }, // Monday
  { day_of_week: 2, start_time: "09:00", end_time: "18:00", is_closed: false }, // Tuesday
  { day_of_week: 3, start_time: "09:00", end_time: "18:00", is_closed: false }, // Wednesday
  { day_of_week: 4, start_time: "09:00", end_time: "18:00", is_closed: false }, // Thursday
  { day_of_week: 5, start_time: "09:00", end_time: "18:00", is_closed: false }, // Friday
  { day_of_week: 6, start_time: "09:00", end_time: "17:00", is_closed: false }, // Saturday
]

export function Step4WorkingHours({ storeId, onNext, onBack }: Step3WorkingHoursProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(DEFAULT_HOURS)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch existing working hours
  useEffect(() => {
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

  const handleSave = async () => {
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

  const updateWorkingHours = (dayOfWeek: number, field: keyof WorkingHours, value: string | boolean) => {
    setWorkingHours((prev) => prev.map((wh) => (wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh)))
  }

  const copyToAllDays = (sourceDay: WorkingHours) => {
    setWorkingHours((prev) =>
      prev.map((wh) => ({
        ...wh,
        start_time: sourceDay.start_time,
        end_time: sourceDay.end_time,
        is_closed: sourceDay.is_closed,
      })),
    )
    toast({
      title: "Hours Copied",
      description: "Working hours have been applied to all days.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Set Your Working Hours</h2>
        <p className="text-muted-foreground">Define when customers can book appointments at your barbershop.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>
            Set your operating hours for each day of the week. Customers can only book during these times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((day) => {
            const dayHours = workingHours.find((wh) => wh.day_of_week === day.value) || DEFAULT_HOURS[day.value]

            return (
              <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-24">
                  <Label className="font-medium">{day.name}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={!dayHours.is_closed}
                    onCheckedChange={(checked) => updateWorkingHours(day.value, "is_closed", !checked)}
                  />
                  <Label className="text-sm">{dayHours.is_closed ? "Closed" : "Open"}</Label>
                </div>

                {!dayHours.is_closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`start-${day.value}`} className="text-sm">
                        From:
                      </Label>
                      <Input
                        id={`start-${day.value}`}
                        type="time"
                        value={dayHours.start_time}
                        onChange={(e) => updateWorkingHours(day.value, "start_time", e.target.value)}
                        className="w-32"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor={`end-${day.value}`} className="text-sm">
                        To:
                      </Label>
                      <Input
                        id={`end-${day.value}`}
                        type="time"
                        value={dayHours.end_time}
                        onChange={(e) => updateWorkingHours(day.value, "end_time", e.target.value)}
                        className="w-32"
                      />
                    </div>

                    <Button variant="outline" size="sm" onClick={() => copyToAllDays(dayHours)} className="text-xs">
                      Copy to all
                    </Button>
                  </>
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
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Continue to Images"}
        </Button>
      </div>
    </div>
  )
}
