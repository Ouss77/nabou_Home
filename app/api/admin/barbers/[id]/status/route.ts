import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { updateBarberStatus } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    await requireAdmin()

    const { status } = await request.json()

    if (!status || !["trial", "active", "expired"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be 'trial', 'active', or 'expired'" }, { status: 400 })
    }

    const updatedBarber = await updateBarberStatus(params.id, status)

    if (!updatedBarber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      barber: updatedBarber,
    })
  } catch (error) {
    console.error("Error updating barber status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
