import { type NextRequest, NextResponse } from "next/server"
import { updateService, deleteService } from "@/lib/db"
import { requireBarber } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireBarber()
    const { name, description, price, duration_minutes } = await request.json()

    if (!name || !price || !duration_minutes) {
      return NextResponse.json({ error: "Name, price, and duration are required" }, { status: 400 })
    } 

    const service = await updateService(params.id, name, description, price, duration_minutes)

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Update service error:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireBarber()
    await deleteService(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete service error:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
