import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, checkAndUpdateBarberTrialStatus } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user by email
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Simple password check (in production, use proper hashing)
    if (user.password_hash !== password && user.password_hash !== `hashed_${password}`) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // For barbers, check and update trial status
    if (user.role === "barber") {
      const updatedUser = await checkAndUpdateBarberTrialStatus(user.id)

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check if barber can access the system
      if (updatedUser.status === "expired") {
        return NextResponse.json(
          {
            error: "Your free trial has ended. Please upgrade to continue using the service.",
            code: "TRIAL_EXPIRED",
          },
          { status: 403 },
        )
      }

      // Only allow trial and active barbers to login
      if (updatedUser.status !== "trial" && updatedUser.status !== "active") {
        return NextResponse.json(
          {
            error: "Account access restricted. Please contact support.",
            code: "ACCESS_DENIED",
          },
          { status: 403 },
        )
      }

      // Use updated user data
      user.status = updatedUser.status
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
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
