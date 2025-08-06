"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WorkingHoursDebugProps {
  storeId: string
}

export function WorkingHoursDebug({ storeId }: WorkingHoursDebugProps) {
  const [workingHours, setWorkingHours] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWorkingHours = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/barber/working-hours?storeId=${storeId}`)
      const data = await response.json()
      console.log("Working hours response:", data)
      setWorkingHours(data.workingHours || [])
    } catch (error) {
      console.error("Error fetching working hours:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={fetchWorkingHours} disabled={loading}>
          {loading ? "Loading..." : "Fetch Working Hours"}
        </Button>

        {workingHours.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Current Working Hours:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(workingHours, null, 2)}</pre>
          </div>
        )}

        {workingHours.length === 0 && !loading && (
          <p className="mt-4 text-sm text-muted-foreground">No working hours found for this store.</p>
        )}
      </CardContent>
    </Card>
  )
}
