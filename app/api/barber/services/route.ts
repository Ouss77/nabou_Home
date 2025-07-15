import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon-config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const services = await sql`
      SELECT id, name, price, duration_minutes, description
      FROM services 
      WHERE store_id = ${storeId} 
      ORDER BY name
    `

    // Set no-cache headers for real-time data
    const response = NextResponse.json(services)
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")

    return response
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const { name, price, duration_minutes, description } = await request.json()

    if (!name || !price || !duration_minutes) {
      return NextResponse.json({ error: "Name, price, and duration are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO services (store_id, name, price, duration_minutes, description, is_active)
      VALUES (${storeId}, ${name}, ${price}, ${duration_minutes}, ${description || ""}, true)
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, price, duration_minutes, description, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE services 
      SET name = ${name}, price = ${price}, duration_minutes = ${duration_minutes}, 
          description = ${description}, is_active = ${is_active}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    await sql`
      UPDATE services 
      SET is_active = false
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
