import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon-config"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const appointmentId = params.id

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, confirmed, cancelled, completed" },
        { status: 400 },
      )
    }

    // Update appointment status
    const result = await sql`
      UPDATE appointments 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${appointmentId}
      RETURNING id, status, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Set no-cache headers for real-time updates
    const response = NextResponse.json({
      success: true,
      appointment: result[0],
    })

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Error updating appointment status:", error)
    return NextResponse.json({ error: "Failed to update appointment status" }, { status: 500 })
  }
}
