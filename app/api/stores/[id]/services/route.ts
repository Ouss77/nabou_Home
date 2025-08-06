import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get services for the store
    const services = await sql`
      SELECT s.* 
      FROM services s
      JOIN barber_services bs ON s.id = bs.service_id
      JOIN barbers b ON bs.barber_id = b.id
      WHERE b.store_id = ${Number.parseInt(id)}
      GROUP BY s.id, s.name, s.description, s.duration_minutes, s.price
      ORDER BY s.name
    `

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}
