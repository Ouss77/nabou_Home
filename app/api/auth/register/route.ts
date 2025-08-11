import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Registration request body:", body) // Debug log

    // Handle both possible field name formats
    const fullName = body.fullName || body.name
    const email = body.email
    const password = body.password
    const confirmPassword = body.confirmPassword
    const phone = body.phone
    const city = body.city

    console.log("Extracted fields:", { fullName, email, password: "***", phone, city }) // Debug log

    // Validation
    if (!fullName || !email || !password || !phone || !city) {
      console.log("Missing fields:", {
        fullName: !fullName,
        email: !email,
        password: !password,
        phone: !phone,
        city: !city,
      })
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Only validate confirmPassword if it's provided (from registration form)
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Phone validation (basic) - remove spaces and dashes for validation
    const cleanPhone = phone.replace(/[\s\-()]/g, "")
    if (cleanPhone.length < 8) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email.toLowerCase())
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    // Hash password (temporarily using plain text)
    const passwordHash = password

    // Create user with additional fields
    const user = await createUserWithProfile(
      email.toLowerCase(),
      passwordHash,
      fullName.trim(),
      "barber",
      phone.trim(),
      city.trim(),
    )

    console.log("User created successfully:", user.id) // Debug log

    // Return success response with user data (excluding password hash)
    return NextResponse.json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        city: user.city,
      },
      credentials: {
        email: email.toLowerCase(),
        password: password, // Return original password for auto-login
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Failed to create account. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Helper function to create user with profile fields
async function createUserWithProfile(
  email: string,
  passwordHash: string,
  name: string,
  role: "admin" | "barber",
  phone: string,
  city: string,
) {
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.DATABASE_URL!)

  try {
    const result = await sql`
      INSERT INTO users (email, password_hash, name, role, phone, city)
      VALUES (${email}, ${passwordHash}, ${name}, ${role}, ${phone}, ${city})
      RETURNING id, email, name, role, phone, city, created_at
    `
    return result[0]
  } catch (dbError) {
    console.error("Database error:", dbError)
    throw new Error("Failed to create user in database")
  }
}
