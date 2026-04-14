import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import MercadoPagoConfig, { Preference } from "mercadopago"
import { BOX_CATALOG } from "@/lib/boxes"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CheckoutItem = {
  id?: string
  name?: string
  product_name?: string
  quantity: number
  price: number
}

function normalizeCartItems(items: CheckoutItem[]) {
  return items.map((item) => ({
    id: String(item.id || item.product_name || item.name || crypto.randomUUID()),
    title: item.name || item.product_name || "Producto",
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.price || 0)
  }))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      source,
      box_id,
      items,
      payment_method,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      delivery_notes
    } = body

    if (!customer_name || !customer_email || !customer_phone || !delivery_address || !delivery_city) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios del receptor" },
        { status: 400 }
      )
    }

    if (payment_method !== "mercadopago" && payment_method !== "cash") {
      return NextResponse.json(
        { error: "Método de pago inválido" },
        { status: 400 }
      )
    }

    let normalizedItems: Array<{
      id: string
      title: string
      quantity: number
      unit_price: number
    }> = []

    if (source === "box") {
      const box = BOX_CATALOG[box_id]

      if (!box) {
        return NextResponse.json(
          { error: "Caja inválida" },
          { status: 400 }
        )
      }

      normalizedItems = [
        {
          id: box_id,
          title: box.name,
          quantity: 1,
          unit_price: box.price
        }
      ]
    } else if (source === "cart") {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: "Carrito vacío" },
          { status: 400 }
        )
      }

      normalizedItems = normalizeCartItems(items).filter(
        (item) => item.quantity > 0 && item.unit_price >= 0
      )
    } else {
      return NextResponse.json(
        { error: "Source inválido" },
        { status: 400 }
      )
    }

    const total = normalizedItems.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    if (total <= 0) {
      return NextResponse.json(
        { error: "Total inválido" },
        { status: 400 }
      )
    }

    let userId: string | null = null

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", customer_email)
      .maybeSingle()

    if (existingUser?.id) {
      userId = existingUser.id
    } else {
      const newUserId = crypto.randomUUID()

      const { data: createdUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          id: newUserId,
          email: customer_email
        })
        .select("id")
        .single()

      if (createUserError || !createdUser?.id) {
        console.error("create user error", createUserError)
        return NextResponse.json(
          { error: "No se pudo crear el usuario comercial" },
          { status: 500 }
        )
      }

      userId = createdUser.id
    }

    await supabase
      .from("profiles")
      .upsert({
        id: userId,
        name: customer_name,
        phone: customer_phone
      })

    await supabase
      .from("addresses")
      .upsert(
        {
          user_id: userId,
          address: delivery_address,
          city: delivery_city,
          notes: delivery_notes || "",
          phone: customer_phone
        },
        { onConflict: "user_id" }
      )

    const initialStatus =
      payment_method === "cash" ? "confirmed" : "pending_payment"

    const initialPaymentStatus =
      payment_method === "cash" ? "pending_cash" : "pending"

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        box_id: source === "box" ? box_id : null,
        source,
        status: initialStatus,
        payment_method,
        payment_status: initialPaymentStatus,
        price: total,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        delivery_city,
        delivery_notes: delivery_notes || ""
      })
      .select()
      .single()

    if (orderError || !order?.id) {
      console.error("order error", orderError)
      return NextResponse.json(
        { error: "No se pudo crear la orden" },
        { status: 500 }
      )
    }

    const orderItems = normalizedItems.map((item) => ({
      order_id: order.id,
      product_name: item.title,
      quantity: item.quantity,
      price: item.unit_price
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("items error", itemsError)
      return NextResponse.json(
        { error: "No se pudieron guardar los items" },
        { status: 500 }
      )
    }

    if (payment_method === "cash") {
      return NextResponse.json({
        ok: true,
        order_id: order.id,
        redirect_to: `/success?order_id=${order.id}`
      })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!
    })

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: normalizedItems.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          currency_id: "ARS",
          unit_price: item.unit_price
        })),
        payer: {
          name: customer_name,
          email: customer_email
        },
        external_reference: order.id,
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${order.id}`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${order.id}&payment=failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${order.id}&payment=pending`
        },
        auto_return: "approved"
      }
    })

    await supabase
      .from("orders")
      .update({
        mp_preference_id: result.id
      })
      .eq("id", order.id)

    return NextResponse.json({
      ok: true,
      order_id: order.id,
      init_point: result.init_point
    })
  } catch (error) {
    console.error("checkout create error", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
