import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const products = await sql`
      SELECT id, name, description, price, category, image_url, stock_quantity, is_active, created_at
      FROM products
      ORDER BY created_at DESC
    `

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, price, category, image_url, stock_quantity } = await request.json()

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_active)
      VALUES (${name}, ${description || null}, ${price}, ${category}, ${image_url || null}, ${stock_quantity || 0}, true)
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
