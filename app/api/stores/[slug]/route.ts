import { NextResponse } from "next/server"
import { getStoreBySlug } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const store = await getStoreBySlug(params.slug)

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error("Error fetching store:", error)
    return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 })
  }
}
