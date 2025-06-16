import { type NextRequest, NextResponse } from "next/server"
import { deleteBlockedTime } from "@/lib/db"
import { requireBarber } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireBarber()
    await deleteBlockedTime(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete blocked time error:", error)
    return NextResponse.json({ error: "Failed to delete blocked time" }, { status: 500 })
  }
}
