import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon-config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")
    const days = searchParams.get("days") || "30"

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(days))

    const appointments = await sql`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.client_name,
        a.client_email,
        a.client_phone,
        a.age,
        s.name as service_name,
        s.price as service_price,
        s.duration_minutes as service_duration,
        a.created_at
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE s.store_id = ${storeId}
        AND a.appointment_date >= ${startDate.toISOString().split("T")[0]}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `

    // Set no-cache headers for real-time data
    const response = NextResponse.json(appointments)
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")

    return response
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}
