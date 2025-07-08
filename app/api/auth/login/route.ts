import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, getBarberAppointmentCount } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Simple password check (in production, use proper hashing)
    if (user.password_hash !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check barber-specific limitations
    if (user.role === "barber") {
      // Check if barber account is expired
      if (user.status === "expired") {
        return NextResponse.json({ error: "Your account has been suspended. Please contact support." }, { status: 403 })
      }

      // Check trial limitations
      if (user.status === "trial") {
        const appointmentCount = await getBarberAppointmentCount(user.id)

        if (appointmentCount > 20) {
          return NextResponse.json(
            { error: "Your free trial has ended. Please upgrade to continue using the service." },
            { status: 403 },
          )
        }
      }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(
      "session",
      JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
