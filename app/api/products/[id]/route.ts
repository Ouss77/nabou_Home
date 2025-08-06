import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    const result = await sql`
      SELECT id, name, description, price, category, image_url, stock_quantity, is_active, created_at
      FROM products
      WHERE id = ${productId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const { name, description, price, category, image_url, stock_quantity, is_active } = await request.json()

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE products 
      SET 
        name = ${name},
        description = ${description || null},
        price = ${price},
        category = ${category},
        image_url = ${image_url || null},
        stock_quantity = ${stock_quantity || 0},
        is_active = ${is_active}
      WHERE id = ${productId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    const result = await sql`
      DELETE FROM products 
      WHERE id = ${productId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
