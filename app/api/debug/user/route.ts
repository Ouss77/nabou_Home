import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({
        found: false,
        message: "User not found",
        email: email,
      })
    }

    // Return user info without sensitive data
    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        password_hash_length: user.password_hash?.length || 0,
        password_hash_preview: user.password_hash?.substring(0, 10) + "..." || "null",
      },
    })
  } catch (error) {
    console.error("Debug user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
