import { type NextRequest, NextResponse } from "next/server"
import { createService } from "@/lib/db"
import { requireBarber } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await requireBarber()
    const { storeId, name, description, price, durationMinutes } = await request.json()

    if (!storeId || !name || !price || !durationMinutes) {
      return NextResponse.json({ error: "Store ID, name, price, and duration are required" }, { status: 400 })
    }

    const service = await createService(storeId, name, description, price, durationMinutes)

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Create service error:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
