import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Box IDs y precios
const BOX_MAP: Record<string, { name: string; price: number }> = {
  "dff394c8-6a17-45e8-ba3f-960c27f8d76c": { name: "Caja Veggie", price: 27800 },
  "d9c75e5b-3e8b-4d3d-9776-d65ad9afae1d": { name: "Caja Campo", price: 47400 },
  "d5b70577-a2b7-47d7-9ccd-e2f336e25af7": { name: "Caja Granja", price: 56800 }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { items, customer, payment_method } = body
    const { box_id } = body

    // 🔥 SI VIENE BOX_ID -> CREAR PREFERENCE MP DIRECTO
    if (box_id && BOX_MAP[box_id]) {
      const box = BOX_MAP[box_id]
      const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: [{
            title: box.name,
            quantity: 1,
            currency_id: "ARS",
            unit_price: box.price
          }],
          external_reference: box_id,
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_BASE_URL}/success?external_reference=${box_id}`,
            failure: `${process.env.NEXT_PUBLIC_BASE_URL}/error`,
            pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pending`
          },
          auto_return: "approved"
        })
      })
      const mpData = await mpRes.json()
      return NextResponse.json({ init_point: mpData.init_point })
    }

    // 🔥 VALIDACIONES PARA CART
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "no items" }, { status: 400 })
    }

    if (!customer?.email) {
      return NextResponse.json({ error: "missing email" }, { status: 400 })
    }

    // 🔥 BUSCAR O CREAR USER
    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", customer.email)
      .maybeSingle()

    if (!user) {
      const userId = crypto.randomUUID()

      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: customer.email
        })
        .select()
        .single()

      if (error || !newUser) {
        return NextResponse.json({ error: "user error" }, { status: 500 })
      }

      user = newUser
    }

    // 🔥 CALCULAR TOTAL
    let total = 0
    for (const item of items) {
      total += (item.price || 0) * (item.quantity || 1)
    }

    // 🔥 CREAR ORDER
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        price: total,
        status: "pending",
        payment_method,
        payment_status: "pending"
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "order error" }, { status: 500 })
    }

    // 🔥 CREAR ITEMS
    const itemsToInsert = items.map((item: any) => ({
      order_id: order.id,
      product_name: item.name || "Producto",
      quantity: item.quantity || 1,
      price: item.price && item.price > 0 ? item.price : 1
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert)

    if (itemsError) {
      console.error("ITEMS ERROR:", itemsError)
      return NextResponse.json({ error: "items error" }, { status: 500 })
    }

    // 🔥 SI ES MP → CREAR PREFERENCE
    if (payment_method === "mercadopago") {
      const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: items.map((item: any) => ({
            title: item.name || "Producto",
            quantity: item.quantity || 1,
            currency_id: "ARS",
            unit_price: item.price && item.price > 0 ? item.price : 1
          })), // 🔥 ESTA COMA ERA CLAVE
          external_reference: order.id,
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${order.id}`,
            failure: `${process.env.NEXT_PUBLIC_BASE_URL}/error`,
            pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pending`
          },
          auto_return: "approved"
        })
      })

      const mpData = await mpRes.json()

      return NextResponse.json({
        checkout_url: mpData.init_point,
        order_id: order.id
      })
    }

    // 🔥 CASH / TRANSFER
    return NextResponse.json({
      success: true,
      order_id: order.id
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}


