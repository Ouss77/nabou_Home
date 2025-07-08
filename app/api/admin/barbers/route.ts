import { NextResponse } from "next/server"
import { getAllBarbers } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()

    const barbers = await getAllBarbers()
    return NextResponse.json(barbers)
  } catch (error) {
    console.error("Error fetching barbers:", error)
    return NextResponse.json({ error: "Failed to fetch barbers" }, { status: 500 })
  }
}
