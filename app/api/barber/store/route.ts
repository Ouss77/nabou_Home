import { type NextRequest, NextResponse } from "next/server"
import { createStore } from "@/lib/db"
import { requireBarber } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await requireBarber()
    const { title, address, description, imageUrl } = await request.json()

    if (!title || !address) {
      return NextResponse.json({ error: "Title and address are required" }, { status: 400 })
    }

    const store = await createStore(user.id, title, address, description, imageUrl)

    return NextResponse.json({ store })
  } catch (error) {
    console.error("Create store error:", error)
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 })
  }
}
