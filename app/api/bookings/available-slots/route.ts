import { type NextRequest, NextResponse } from "next/server"
import { getBookedTimeSlots } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")
    const date = searchParams.get("date")
    const clientTimezone = searchParams.get("timezone") || "UTC"
    const clientTime = searchParams.get("clientTime")

    if (!storeId || !date) {
      return NextResponse.json({ error: "Store ID and date are required" }, { status: 400 })
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    // Get booked times from database
    const bookedTimes = await getBookedTimeSlots(storeId, date)

    // Return data without server-side time calculations
    // Let the client handle timezone-specific logic
    return NextResponse.json({
      bookedTimes,
      serverTime: new Date().toISOString(),
      requestedDate: date,
      clientTimezone,
      clientTime,
    })
  } catch (error) {
    console.error("Get available slots error:", error)
    return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 })
  }
}
