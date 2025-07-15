import { type NextRequest, NextResponse } from "next/server"
import { createService, getServicesByStoreId } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const services = await getServicesByStoreId(storeId)
    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await auth()
    if (!user || user.role !== "barber") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { storeId, name, description, price, duration } = await request.json()

    if (!storeId || !name || price === undefined || duration === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newService = await createService(storeId, name, description || null, price, duration)
    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
