import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isBlank(value: unknown) {
  return typeof value !== "string" || value.trim() === ""
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || "").trim().toLowerCase()

    if (isBlank(email)) {
      return NextResponse.json(
        { error: "Ingresá un email válido" },
        { status: 400 }
      )
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, source, neighborhood_id, created_at")
      .eq("customer_email", email)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (orderError) {
      console.error("last order error", orderError)
      return NextResponse.json(
        { error: "No se pudo buscar el último pedido" },
        { status: 500 }
      )
    }

    if (!order?.id) {
      return NextResponse.json(
        { error: "No encontramos pedidos anteriores con ese email" },
        { status: 404 }
      )
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, price")
      .eq("order_id", order.id)

    if (itemsError) {
      console.error("last order items error", itemsError)
      return NextResponse.json(
        { error: "No se pudieron cargar los productos del último pedido" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      order_id: order.id,
      source: order.source,
      neighborhood_id: order.neighborhood_id,
      items: orderItems || []
    })
  } catch (error) {
    console.error("last order endpoint error", error)
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}
