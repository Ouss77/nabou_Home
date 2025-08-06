import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id

    // Get order details
    const orderResult = await sql`
      SELECT 
        id,
        order_number,
        customer_email,
        customer_phone,
        customer_first_name,
        customer_last_name,
        shipping_address,
        payment_method,
        subtotal_amount,
        tax_amount,
        total_amount,
        status,
        notes,
        created_at
      FROM orders 
      WHERE id = ${orderId}
    `

    if (orderResult.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult[0]

    // Get order items
    const itemsResult = await sql`
      SELECT 
        oi.quantity,
        oi.price,
        p.name as product_name,
        p.description as product_description
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId}
    `

    return NextResponse.json({
      ...order,
      items: itemsResult,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
