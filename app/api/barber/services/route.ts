import { type NextRequest, NextResponse } from "next/server"
import { createService } from "@/lib/db"
import { requireBarber } from "@/lib/auth"
import { getServicesByStoreId } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    await requireBarber()
    const { storeId, name, description, price, duration_minutes } = await request.json()

    if (!storeId || !name || !price || !duration_minutes) {
      return NextResponse.json({ error: "Store ID, name, price, and duration are required" }, { status: 400 })
    }

    const service = await createService(storeId, name, description, price, duration_minutes)

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Create service error:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId" }, { status: 400 })
    }
    
    const services = await getServicesByStoreId(storeId);
    
    return NextResponse.json({ services })
  } catch (error) {
    console.error("Fetch services error:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}
