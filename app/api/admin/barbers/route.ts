import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Simple password hashing for demo (in production, use bcrypt)
    const passwordHash = `hashed_${password}`

    const barber = await createUser(email, passwordHash, name, "barber")

    return NextResponse.json({ barber })
  } catch (error) {
    console.error("Create barber error:", error)
    return NextResponse.json({ error: "Failed to create barber" }, { status: 500 })
  }
}
