import { NextResponse, type NextRequest } from "next/server"
import { getAllBarbers, createUser } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()

    const barbers = await getAllBarbers()
    return NextResponse.json(barbers)
  } catch (error) {
    console.error("Error fetching barbers:", error)
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch barbers" }, { status: 500 })
  }
}

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
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to create barber" }, { status: 500 })
  }
}
