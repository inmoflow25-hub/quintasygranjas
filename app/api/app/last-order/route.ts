import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeEmail(email: string | null | undefined) {
  return String(email || "").trim().toLowerCase()
}

function normalizeArgentinaPhone(rawPhone: string | null | undefined) {
  let phone = String(rawPhone || "").replace(/\D/g, "")

  if (!phone) return ""

  if (phone.startsWith("00")) {
    phone = phone.slice(2)
  }

  if (phone.startsWith("011")) {
    phone = `11${phone.slice(3)}`
  }

  if (phone.startsWith("15") && phone.length >= 10) {
    phone = `11${phone.slice(2)}`
  }

  if (phone.startsWith("5411")) {
    phone = `54911${phone.slice(4)}`
  }

  if (phone.startsWith("54911")) {
    return `+${phone}`
  }

  if (phone.startsWith("11")) {
    return `+549${phone}`
  }

  if (phone.startsWith("54") && !phone.startsWith("549")) {
    return `+549${phone.slice(2)}`
  }

  return `+54${phone}`
}

async function findUserId({
  email,
  phone
}: {
  email: string
  phone: string
}) {
  if (email) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (error) {
      console.error("last order profile email lookup error", error)
    }

    if (data?.id) return data.id
  }

  if (phone) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle()

    if (error) {
      console.error("last order profile phone lookup error", error)
    }

    if (data?.id) return data.id
  }

  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const email = normalizeEmail(body.email)
    const phone = normalizeArgentinaPhone(body.phone || body.customer_phone)

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Necesitamos email o WhatsApp para buscar tu último pedido" },
        { status: 400 }
      )
    }

    const userId = await findUserId({ email, phone })

    if (!userId) {
      return NextResponse.json({
        ok: true,
        exists: false,
        order: null,
        items: []
      })
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        created_at,
        status,
        payment_method,
        payment_status,
        source,
        app_context,
        subtotal_price,
        final_price,
        price,
        delivery_address,
        delivery_city,
        delivery_notes
      `)
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (orderError) {
      console.error("last order lookup error", orderError)

      return NextResponse.json(
        { error: "No se pudo consultar tu último pedido" },
        { status: 500 }
      )
    }

    if (!order?.id) {
      return NextResponse.json({
        ok: true,
        exists: true,
        user_id: userId,
        order: null,
        items: []
      })
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        product_name,
        quantity,
        price,
        source_type
      `)
      .eq("order_id", order.id)
      .order("created_at", { ascending: true })

    if (itemsError) {
      console.error("last order items lookup error", itemsError)

      return NextResponse.json(
        { error: "No se pudieron consultar los productos del último pedido" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      exists: true,
      user_id: userId,
      order: {
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        source: order.source,
        app_context: order.app_context || "web",
        subtotal_price: Number(order.subtotal_price || 0),
        final_price: Number(order.final_price || order.price || 0),
        delivery_address: order.delivery_address || "",
        delivery_city: order.delivery_city || "",
        delivery_notes: order.delivery_notes || ""
      },
      items: (items || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        name: item.product_name,
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        source_type: item.source_type || "product"
      }))
    })
  } catch (error: any) {
    console.error("app last order route error", error)

    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
