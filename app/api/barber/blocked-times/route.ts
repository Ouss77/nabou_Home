import { type NextRequest, NextResponse } from "next/server"
import { createBlockedTime, getBlockedTimesByStoreId } from "@/lib/db"
import { requireBarber } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireBarber()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const blockedTimes = await getBlockedTimesByStoreId(storeId)
    return NextResponse.json({ blockedTimes })
  } catch (error) {
    console.error("Get blocked times error:", error)
    return NextResponse.json({ error: "Failed to fetch blocked times" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireBarber()
    const { storeId, blockedDate, startTime, endTime, reason } = await request.json()

    if (!storeId || !blockedDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Store ID, date, start time, and end time are required" }, { status: 400 })
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json({ error: "Invalid time format" }, { status: 400 })
    }

    // Validate that start time is before end time
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes

    if (startTotalMinutes >= endTotalMinutes) {
      return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 })
    }

    const blockedTime = await createBlockedTime(storeId, blockedDate, startTime, endTime, reason)

    return NextResponse.json({ blockedTime })
  } catch (error) {
    console.error("Create blocked time error:", error)
    return NextResponse.json({ error: "Failed to create blocked time" }, { status: 500 })
  }
}
