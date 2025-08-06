import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if id is numeric (store ID) or string (store slug)
    const isNumeric = /^\d+$/.test(id)

    let store
    if (isNumeric) {
      // Query by ID
      const stores = await sql`
        SELECT * FROM stores WHERE id = ${Number.parseInt(id)}
      `
      store = stores[0]
    } else {
      // Query by slug
      const stores = await sql`
        SELECT * FROM stores WHERE slug = ${id}
      `
      store = stores[0]
    }

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Get store images
    const images = await sql`
      SELECT * FROM store_images 
      WHERE store_id = ${store.id} 
      ORDER BY is_primary DESC, created_at ASC
    `

    return NextResponse.json({
      ...store,
      images: images || [],
    })
  } catch (error) {
    console.error("Error fetching store:", error)
    return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 })
  }
}
