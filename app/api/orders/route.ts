import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (
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
        notes
      )
      VALUES (
        ${orderNumber},
        ${orderData.customer.email},
        ${orderData.customer.phone},
        ${orderData.customer.firstName},
        ${orderData.customer.lastName},
        ${JSON.stringify(orderData.shipping)},
        ${orderData.payment.method},
        ${orderData.totals.subtotal},
        ${orderData.totals.tax},
        ${orderData.totals.total},
        'confirmed',
        ${orderData.notes || null}
      )
      RETURNING id, order_number, created_at
    `

    const order = orderResult[0]

    // Create order items
    for (const item of orderData.items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${order.id}, ${item.product_id}, ${item.quantity}, ${item.price})
      `
    }

    return NextResponse.json({
      id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      status: "confirmed",
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
