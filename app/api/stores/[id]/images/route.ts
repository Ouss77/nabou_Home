import { type NextRequest, NextResponse } from "next/server"
import { getStoreImages } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const images = await getStoreImages(params.id)
    return NextResponse.json({ images })
  } catch (error) {
    console.error("Get public store images error:", error)
    return NextResponse.json({ error: "Failed to fetch store images" }, { status: 500 })
  }
}
