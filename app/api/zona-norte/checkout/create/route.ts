import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import MercadoPagoConfig, { Preference } from "mercadopago"

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

function applyDiscountToItems(
  items: Array<{ id: string; title: string; quantity: number; unit_price: number }>,
  discountPercent: number
) {
  if (discountPercent <= 0) return items

  return items.map((item) => ({
    ...item,
    unit_price: Math.max(
      0,
      Math.round(item.unit_price * (1 - discountPercent / 100))
    )
  }))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      source,
      neighborhood_slug,
      items,
      payment_method,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      delivery_notes
    } = body

    if (source !== "zona-norte") {
      return NextResponse.json(
        { error: "Source inválido para Zona Norte" },
        { status: 400 }
      )
    }

    if (!neighborhood_slug) {
      return NextResponse.json(
        { error: "Falta barrio" },
        { status: 400 }
      )
    }

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

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Carrito vacío" },
        { status: 400 }
      )
    }

    const { data: neighborhood, error: neighborhoodError } = await supabase
      .from("neighborhoods")
      .select("id, zone_id, slug, name, active")
      .eq("slug", neighborhood_slug)
      .eq("active", true)
      .maybeSingle()

    if (neighborhoodError || !neighborhood?.id) {
      return NextResponse.json(
        { error: "Barrio inválido" },
        { status: 400 }
      )
    }

    const normalizedItems = normalizeCartItems(items).filter(
      (item) => item.quantity > 0 && item.unit_price >= 0
    )

    const baseTotal = normalizedItems.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    if (baseTotal < 20000) {
      return NextResponse.json(
        { error: "El pedido mínimo es de $20.000" },
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

    await supabase
      .from("user_neighborhoods")
      .upsert(
        {
          user_id: userId,
          neighborhood_id: neighborhood.id,
          source: "zona-norte"
        },
        { onConflict: "user_id,neighborhood_id" }
      )

    const { data: benefit } = await supabase
      .from("user_benefits")
      .select("id, discount_percent")
      .eq("user_id", userId)
      .eq("neighborhood_id", neighborhood.id)
      .eq("status", "available")
      .order("discount_percent", { ascending: false })
      .limit(1)
      .maybeSingle()

    const discountPercent = Number(benefit?.discount_percent || 0)
    const discountAmount = Math.round(baseTotal * (discountPercent / 100))
    const finalTotal = Math.max(0, baseTotal - discountAmount)

    const discountedItems = applyDiscountToItems(normalizedItems, discountPercent)

    const initialStatus =
      payment_method === "cash" ? "confirmed" : "pending_payment"

    const initialPaymentStatus =
      payment_method === "cash" ? "pending_cash" : "pending"

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        box_id: null,
        source: "zona-norte",
        zone_id: neighborhood.zone_id,
        neighborhood_id: neighborhood.id,
        status: initialStatus,
        payment_method,
        payment_status: initialPaymentStatus,
        price: finalTotal,
        base_price: baseTotal,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        final_price: finalTotal,
        benefit_status: benefit?.id ? "used" : "none",
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

    if (benefit?.id) {
      await supabase
        .from("user_benefits")
        .update({
          status: "used",
          used_order_id: order.id,
          used_at: new Date().toISOString()
        })
        .eq("id", benefit.id)
    }

    if (payment_method === "cash") {
      return NextResponse.json({
        ok: true,
        order_id: order.id,
        base_price: baseTotal,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        final_price: finalTotal,
        redirect_to: `/success?order_id=${order.id}`
      })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!
    })

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: discountedItems.map((item) => ({
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
      base_price: baseTotal,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      final_price: finalTotal,
      init_point: result.init_point
    })
  } catch (error) {
    console.error("zona norte checkout create error", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
