import { type NextRequest, NextResponse } from "next/server"
import { getWorkingHoursByStoreId, upsertWorkingHours } from "@/lib/db"
import { requireBarber } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireBarber()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const workingHours = await getWorkingHoursByStoreId(storeId)
    return NextResponse.json({ workingHours })
  } catch (error) {
    console.error("Get working hours error:", error)
    return NextResponse.json({ error: "Failed to fetch working hours" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireBarber()
    const body = await request.json()
    console.log("Working hours request body:", body)

    const { storeId, workingHours } = body

    if (!storeId || !Array.isArray(workingHours)) {
      console.error("Invalid request:", { storeId, workingHours })
      return NextResponse.json({ error: "Store ID and working hours array are required" }, { status: 400 })
    }

    console.log("Processing working hours for store:", storeId)
    console.log("Working hours data:", workingHours)

    // Validate working hours format
    for (const wh of workingHours) {
      if (typeof wh.day_of_week !== "number" || wh.day_of_week < 0 || wh.day_of_week > 6) {
        console.error("Invalid day of week:", wh)
        return NextResponse.json({ error: "Invalid day of week" }, { status: 400 })
      }

      if (!wh.is_closed) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(wh.start_time) || !timeRegex.test(wh.end_time)) {
          console.error("Invalid time format:", wh)
          return NextResponse.json({ error: "Invalid time format" }, { status: 400 })
        }

        // Validate that start time is before end time
        const [startHours, startMinutes] = wh.start_time.split(":").map(Number)
        const [endHours, endMinutes] = wh.end_time.split(":").map(Number)
        const startTotalMinutes = startHours * 60 + startMinutes
        const endTotalMinutes = endHours * 60 + endMinutes

        if (startTotalMinutes >= endTotalMinutes) {
          console.error("Invalid time range:", wh)
          return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 })
        }
      }
    }

    const updatedWorkingHours = await upsertWorkingHours(storeId, workingHours)
    console.log("Successfully saved working hours:", updatedWorkingHours)

    return NextResponse.json({ workingHours: updatedWorkingHours })
  } catch (error) {
    console.error("Update working hours error:", error)
    return NextResponse.json({ error: "Failed to update working hours" }, { status: 500 })
  }
}
