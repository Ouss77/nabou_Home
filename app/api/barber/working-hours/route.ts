import { type NextRequest, NextResponse } from "next/server"
import { getWorkingHoursByStoreId, upsertWorkingHours } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const workingHours = await getWorkingHoursByStoreId(storeId)
    return NextResponse.json({ workingHours })
  } catch (error) {
    console.error("Error fetching working hours:", error)
    return NextResponse.json({ error: "Failed to fetch working hours" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await auth()
    if (!user || user.role !== "barber") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { storeId, workingHours } = await request.json()

    if (!storeId || !Array.isArray(workingHours)) {
      return NextResponse.json({ error: "Missing required fields or invalid data format" }, { status: 400 })
    }

    const updatedWorkingHours = await upsertWorkingHours(storeId, workingHours)
    return NextResponse.json({ workingHours: updatedWorkingHours }, { status: 200 })
  } catch (error) {
    console.error("Error upserting working hours:", error)
    return NextResponse.json({ error: "Failed to save working hours" }, { status: 500 })
  }
}
