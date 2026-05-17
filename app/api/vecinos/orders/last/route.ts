import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = normalizeEmail(body.email)

    if (!email) {
      return NextResponse.json(
        { error: "Falta email" },
        { status: 400 }
      )
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, created_at, customer_email, commercial_location_id")
      .eq("source", "vecinos")
      .eq("status", "confirmed")
      .eq("customer_email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (orderError) {
      console.error("last vecinos order error", orderError)
      return NextResponse.json(
        { error: "Error buscando último pedido" },
        { status: 500 }
      )
    }

    if (!order?.id) {
      return NextResponse.json(
        { error: "No encontramos pedidos anteriores con ese email" },
        { status: 404 }
      )
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, price")
      .eq("order_id", order.id)

    if (itemsError) {
      console.error("last vecinos items error", itemsError)
      return NextResponse.json(
        { error: "Error buscando productos del pedido" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      order,
      items: items || []
    })
  } catch (error) {
    console.error("last vecinos order api error", error)
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}
