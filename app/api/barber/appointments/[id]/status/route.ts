import { type NextRequest, NextResponse } from "next/server"
import { requireBarber } from "@/lib/auth"
import { sql } from "@/lib/neon-config"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireBarber()
    const { status } = await request.json()
    const appointmentId = params.id

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Verify the appointment belongs to the barber's store
    const appointmentCheck = await sql`
      SELECT a.id, a.store_id, s.barber_id
      FROM appointments a
      JOIN stores s ON a.store_id = s.id
      WHERE a.id = ${appointmentId} AND s.barber_id = ${user.id}
    `

    if (appointmentCheck.length === 0) {
      return NextResponse.json({ error: "Appointment not found or access denied" }, { status: 404 })
    }

    // Update the appointment status
    const result = await sql`
      UPDATE appointments 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${appointmentId}
      RETURNING id, status, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      appointment: result[0],
    })
  } catch (error) {
    console.error("Error updating appointment status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
