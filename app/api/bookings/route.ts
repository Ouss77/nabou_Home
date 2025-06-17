import { type NextRequest, NextResponse } from "next/server"
import { createAppointment, BookingConflictError, PastAppointmentError } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const {
      storeId,
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      appointmentDate,
      appointmentTime,
      notes,
      age,
      clientTimezone,
      clientDateTime,
    } = await request.json()

    if (!storeId || !serviceId || !clientName || !clientEmail || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate appointment time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(appointmentTime)) {
      return NextResponse.json({ error: "Invalid time format" }, { status: 400 })
    }

    // Basic server-side validation for obviously past dates
    const appointmentDateObj = new Date(appointmentDate)
    const serverNow = new Date()

    // Only reject if the date is clearly in the past (more than 1 day ago)
    const oneDayAgo = new Date(serverNow)
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    if (appointmentDateObj < oneDayAgo) {
      return NextResponse.json({ error: "Cannot book appointments for past dates" }, { status: 400 })
    }

    const appointment = await createAppointment(
      storeId,
      serviceId,
      clientName,
      clientEmail,
      clientPhone || "",
      appointmentDate,
      appointmentTime,
      notes,
      age,
    )

    return NextResponse.json({
      appointment,
      serverTime: serverNow.toISOString(),
    })
  } catch (error) {
    console.error("Create appointment error:", error)

    // Handle past appointment attempts
    if (error instanceof PastAppointmentError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Handle booking conflicts specifically
    if (error instanceof BookingConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    // Handle other errors
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}
