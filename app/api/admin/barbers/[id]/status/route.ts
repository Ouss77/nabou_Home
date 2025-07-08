import { type NextRequest, NextResponse } from "next/server"
import { updateBarberStatus } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const { status } = await request.json()
    const barberId = params.id

    if (!status || !["trial", "active", "expired"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be 'trial', 'active', or 'expired'" }, { status: 400 })
    }

    const updatedBarber = await updateBarberStatus(barberId, status)

    if (!updatedBarber) {
      return NextResponse.json({ error: "Barber not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      barber: updatedBarber,
      message: `Barber status updated to ${status}`,
    })
  } catch (error) {
    console.error("Update barber status error:", error)
    return NextResponse.json({ error: "Failed to update barber status" }, { status: 500 })
  }
}
