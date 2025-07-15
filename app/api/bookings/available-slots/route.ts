import { type NextRequest, NextResponse } from "next/server"
import { getAvailableTimeSlots } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")
    const date = searchParams.get("date")
    const serviceDuration = searchParams.get("serviceDuration")

    if (!storeId || !date) {
      return NextResponse.json({ error: "Store ID and date are required" }, { status: 400 })
    }

    const duration = serviceDuration ? Number.parseInt(serviceDuration, 10) : 30 // Default to 30 if not provided

    const availableSlots = await getAvailableTimeSlots(storeId, date, duration)

    return NextResponse.json({
      availableSlots,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching available slots:", error)
    return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 })
  }
}
