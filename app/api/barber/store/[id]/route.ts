import { type NextRequest, NextResponse } from "next/server"
import { updateStore } from "@/lib/db"
import { requireBarber } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireBarber()
    const { title, address, description, imageUrl } = await request.json()

    if (!title || !address) {
      return NextResponse.json({ error: "Title and address are required" }, { status: 400 })
    }

    const store = await updateStore(params.id, title, address, description, imageUrl)

    return NextResponse.json({ store })
  } catch (error) {
    console.error("Update store error:", error)
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 })
  }
}
