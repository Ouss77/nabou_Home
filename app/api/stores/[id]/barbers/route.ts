import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get barbers for the store
    const barbers = await sql`
      SELECT * FROM barbers 
      WHERE store_id = ${Number.parseInt(id)} 
      AND status = 'active'
      ORDER BY name
    `

    return NextResponse.json(barbers)
  } catch (error) {
    console.error("Error fetching barbers:", error)
    return NextResponse.json({ error: "Failed to fetch barbers" }, { status: 500 })
  }
}
