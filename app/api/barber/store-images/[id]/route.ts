import { type NextRequest, NextResponse } from "next/server"
import { deleteStoreImage, setPrimaryStoreImage } from "@/lib/db"
import { requireBarber } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireBarber()
    await deleteStoreImage(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete store image error:", error)
    return NextResponse.json({ error: "Failed to delete store image" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireBarber()
    const { storeId, action } = await request.json()

    if (action === "setPrimary") {
      await setPrimaryStoreImage(storeId, params.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Update store image error:", error)
    return NextResponse.json({ error: "Failed to update store image" }, { status: 500 })
  }
}
