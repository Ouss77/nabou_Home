import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromCookie } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromCookie()
    if (!user || user.role !== "barber") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    // Verify the store belongs to the user
    const storeCheck = await sql`
      SELECT id FROM stores WHERE id = ${storeId} AND barber_id = ${user.id}
    `

    if (storeCheck.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Get landing page data
    const result = await sql`
      SELECT * FROM landing_page_data WHERE store_id = ${storeId}
    `

    const data = result[0] || {}

    return NextResponse.json({
      success: true,
      data: {
        bio: data.bio || "",
        specialties: data.specialties || [],
        experience_years: data.experience_years || 0,
        social_links: data.social_links || {},
        external_booking_links: data.external_booking_links || [],
        testimonials: data.testimonials || [],
      },
    })
  } catch (error) {
    console.error("Error fetching landing page data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromCookie()
    if (!user || user.role !== "barber") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { storeId, bio, specialties, experience_years, social_links, external_booking_links, testimonials } = body

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    // Verify the store belongs to the user
    const storeCheck = await sql`
      SELECT id FROM stores WHERE id = ${storeId} AND barber_id = ${user.id}
    `

    if (storeCheck.length === 0) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Upsert landing page data
    await sql`
      INSERT INTO landing_page_data (
        store_id, bio, specialties, experience_years, 
        social_links, external_booking_links, testimonials
      )
      VALUES (
        ${storeId}, ${bio || ""}, ${JSON.stringify(specialties || [])}, ${experience_years || 0},
        ${JSON.stringify(social_links || {})}, ${JSON.stringify(external_booking_links || [])}, 
        ${JSON.stringify(testimonials || [])}
      )
      ON CONFLICT (store_id) 
      DO UPDATE SET
        bio = EXCLUDED.bio,
        specialties = EXCLUDED.specialties,
        experience_years = EXCLUDED.experience_years,
        social_links = EXCLUDED.social_links,
        external_booking_links = EXCLUDED.external_booking_links,
        testimonials = EXCLUDED.testimonials,
        updated_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving landing page data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
