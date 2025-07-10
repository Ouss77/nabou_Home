import { NextResponse } from "next/server"
import { getServicesByStoreId } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const services = await getServicesByStoreId(params.id)
    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}
