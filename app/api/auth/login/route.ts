import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, checkAndUpdateBarberTrialStatus } from "@/lib/db"
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

    // Simple password verification (in production, use bcrypt)
    const isValidPassword = user.password_hash === `hashed_${password}` || user.password_hash === password

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // For barbers, check trial status and appointment limits
    if (user.role === "barber") {
      try {
        const currentStatus = await checkAndUpdateBarberTrialStatus(user.id)

        // Block access for expired barbers
        if (currentStatus === "expired") {
          return NextResponse.json(
            {
              error: "Your free trial has ended. Please upgrade to continue using the service.",
              trialExpired: true,
            },
            { status: 403 },
          )
        }

        // Update user object with current status
        user.status = currentStatus
      } catch (error) {
        console.error("Error checking trial status:", error)
        // Allow login but log the error
      }
    }

    // Create session cookie
    const cookieStore = await cookies()
    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    }

    cookieStore.set("user", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      user: userSession,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
