import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")
    const date = searchParams.get("date")
    const timezone = searchParams.get("timezone") || "UTC"
    const clientTime = searchParams.get("clientTime")

    if (!storeId || !date) {
      return NextResponse.json({ error: "Store ID and date are required" }, { status: 400 })
    }

    // Get all bookings for the specified date and store
    const bookings = await sql`
      SELECT appointment_time 
      FROM bookings 
      WHERE store_id = ${storeId} 
      AND DATE(appointment_date) = ${date}
      AND status != 'cancelled'
    `

    // Extract booked time slots
    const bookedTimes = bookings.map((booking) => {
      const time = new Date(booking.appointment_time)
      return time.toTimeString().slice(0, 5) // Format as HH:MM
    })

    return NextResponse.json({
      bookedTimes,
      availableSlots: [], // This would be calculated based on working hours
      success: true,
    })
  } catch (error) {
    console.error("Error fetching available slots:", error)
    return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 })
  }
}
