import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, checkAndUpdateBarberTrialStatus } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password - handle demo accounts and registered users
    let validPassword = false

    // Check demo accounts first
    if (email === "admin@barbershop.com" && password === "admin123") {
      validPassword = true
    } else if (email === "john@barbershop.com" && password === "barber123") {
      validPassword = true
    } else {
      // For registered users, compare with stored password
      // Temporarily using plain text comparison
      validPassword = user.password_hash === password
    }

    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // For barbers, check trial status and appointment count
    if (user.role === "barber") {
      const updatedUser = await checkAndUpdateBarberTrialStatus(user.id)

      if (!updatedUser) {
        return NextResponse.json({ error: "User account not found" }, { status: 404 })
      }

      // Block access for expired barbers
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
            error: "Account access is restricted. Please contact support.",
            code: "ACCESS_RESTRICTED",
          },
          { status: 403 },
        )
      }

      // Use the updated user data for session
      user.status = updatedUser.status
    }

    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    }

    const cookieStore = await cookies()
    cookieStore.set("user", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ user: userSession })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
