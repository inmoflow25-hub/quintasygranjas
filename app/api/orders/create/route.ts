import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import MercadoPagoConfig, { Preference } from "mercadopago"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Box IDs y precios - ACTUALIZADO
const BOX_MAP: Record<string, { name: string; price: number }> = {
  "dff394c8-6a17-45e8-ba3f-960c27f8d76c": { name: "Caja Veggie", price: 27800 },
  "d9c75e5b-3e8b-4d3d-9776-d65ad9afae1d": { name: "Caja Campo", price: 47400 },
  "d5b70577-a2b7-47d7-9ccd-e2f336e25af7": { name: "Caja Granja", price: 56800 }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customer, payment_method, box_id } = body

    // SI VIENE BOX_ID -> CREAR PREFERENCE MP
    if (box_id && BOX_MAP[box_id]) {
      const box = BOX_MAP[box_id]
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
      const preference = new Preference(client)
      
      const result = await preference.create({
        body: {
          items: [{
            id: box_id,
            title: box.name,
            quantity: 1,
            currency_id: "ARS",
            unit_price: box.price
          }],
          external_reference: box_id,
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
            failure: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
            pending: `${process.env.NEXT_PUBLIC_BASE_URL}/`
          },
          auto_return: "approved"
        }
      })
      
      return NextResponse.json({ init_point: result.init_point })
    }

    // VALIDACIONES PARA CART
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "no items" }, { status: 400 })
    }

    // Calcular total
    const total = items.reduce((acc: number, item: any) => {
      return acc + (item.price || 0) * (item.quantity || 1)
    }, 0)

    // Crear orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        price: total,
        status: "pending",
        payment_method: payment_method || "cash"
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order error:", orderError)
      return NextResponse.json({ error: "order error" }, { status: 500 })
    }

    // Insertar items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_name: item.name || item.product_name,
      quantity: item.quantity || 1,
      price: item.price > 0 ? item.price : 1
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Items error:", itemsError)
      return NextResponse.json({ error: "items error" }, { status: 500 })
    }

    // Si es MP, crear preference
    if (payment_method === "mercadopago") {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
      const preference = new Preference(client)
      
      const result = await preference.create({
        body: {
          items: items.map((item: any) => ({
            id: String(item.id || "item"),
            title: item.name || item.product_name,
            quantity: item.quantity || 1,
            currency_id: "ARS",
            unit_price: item.price || 1
          })),
          external_reference: order.id,
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${order.id}`,
            failure: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
            pending: `${process.env.NEXT_PUBLIC_BASE_URL}/`
          },
          auto_return: "approved"
        }
      })
      
      return NextResponse.json({ init_point: result.init_point, order_id: order.id })
    }

    // Cash - retornar order_id
    return NextResponse.json({ order_id: order.id })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}

