import { NextResponse } from "next/server"
import { getAllAppointments } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()

    const appointments = await getAllAppointments()
    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}
