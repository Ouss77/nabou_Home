import { type NextRequest, NextResponse } from "next/server"
import { deleteService, updateService } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await auth()
    if (!user || user.role !== "barber") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceId = params.id
    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    await deleteService(serviceId)
    return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await auth()
    if (!user || user.role !== "barber") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceId = params.id
    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    const { name, description, price, duration } = await request.json()

    if (!name || price === undefined || duration === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedService = await updateService(serviceId, name, description || null, price, duration)
    return NextResponse.json(updatedService, { status: 200 })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}
