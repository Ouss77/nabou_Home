import { type NextRequest, NextResponse } from "next/server"
import { requireBarber } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await requireBarber()
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    // Verify the store belongs to the authenticated barber
    const store = await sql`
      SELECT id FROM stores WHERE id = ${storeId} AND barber_id = ${user.id}
    `

    if (!store[0]) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Get landing page data
    const landingPageData = await sql`
      SELECT * FROM landing_page_data WHERE store_id = ${storeId}
    `

    return NextResponse.json({
      success: true,
      data: landingPageData[0] || {},
    })
  } catch (error) {
    console.error("Landing page GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireBarber()
    const body = await request.json()
    const { storeId, ...landingPageData } = body

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    // Verify the store belongs to the authenticated barber
    const store = await sql`
      SELECT id FROM stores WHERE id = ${storeId} AND barber_id = ${user.id}
    `

    if (!store[0]) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Upsert landing page data
    await sql`
      INSERT INTO landing_page_data (
        store_id, bio, specialties, experience_years, social_links, 
        external_booking_links, testimonials, updated_at
      )
      VALUES (
        ${storeId}, 
        ${landingPageData.bio || null},
        ${JSON.stringify(landingPageData.specialties || [])},
        ${landingPageData.experience_years || null},
        ${JSON.stringify(landingPageData.social_links || {})},
        ${JSON.stringify(landingPageData.external_booking_links || [])},
        ${JSON.stringify(landingPageData.testimonials || [])},
        NOW()
      )
      ON CONFLICT (store_id) 
      DO UPDATE SET
        bio = EXCLUDED.bio,
        specialties = EXCLUDED.specialties,
        experience_years = EXCLUDED.experience_years,
        social_links = EXCLUDED.social_links,
        external_booking_links = EXCLUDED.external_booking_links,
        testimonials = EXCLUDED.testimonials,
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Landing page PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
