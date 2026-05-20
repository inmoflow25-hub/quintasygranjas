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

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

function normalizeMoney(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0
  }

  return Math.round(numberValue)
}

function normalizeCartItems(items: CheckoutItem[]) {
  return items.map((item) => ({
    id: String(item.id || item.product_name || item.name || crypto.randomUUID()),
    title: item.name || item.product_name || "Producto",
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.price || 0)
  }))
}

async function getOrCreateCommercialUser({
  customer_email,
  customer_name,
  customer_phone
}: {
  customer_email: string
  customer_name: string
  customer_phone: string
}) {
  const email = normalizeEmail(customer_email)

  const { data: existingUser } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", email)
    .maybeSingle()

  if (existingUser?.id) {
    await supabase
      .from("profiles")
      .upsert({
        id: existingUser.id,
        name: customer_name,
        full_name: customer_name,
        email,
        phone: customer_phone
      })

    return existingUser.id as string
  }

  const newUserId = crypto.randomUUID()

  const { data: createdUser, error: createUserError } = await supabase
    .from("users")
    .insert({
      id: newUserId,
      email,
      name: customer_name
    })
    .select("id")
    .single()

  if (createUserError || !createdUser?.id) {
    console.error("create user error", createUserError)
    throw new Error("No se pudo crear el usuario comercial")
  }

  await supabase
    .from("profiles")
    .upsert({
      id: createdUser.id,
      name: customer_name,
      full_name: customer_name,
      email,
      phone: customer_phone
    })

  return createdUser.id as string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      commercial_location_id,
      items,
      payment_method,
      customer_name,
      customer_email,
      customer_phone,
      apartment_floor,
      apartment_unit,
      delivery_notes
    } = body

    const propina = normalizeMoney(body.propina)

    if (
      !commercial_location_id ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !apartment_floor ||
      !apartment_unit
    ) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
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

    const { data: location, error: locationError } = await supabase
      .from("commercial_locations")
      .select("id, slug, name, type, parent_location_id, address, city, is_active")
      .eq("id", commercial_location_id)
      .eq("is_active", true)
      .single()

    if (locationError || !location) {
      return NextResponse.json(
        { error: "Edificio inválido" },
        { status: 400 }
      )
    }

    const clusterLocationId =
      location.type === "cluster"
        ? location.id
        : location.parent_location_id

    if (!clusterLocationId) {
      return NextResponse.json(
        { error: "La torre no tiene manzana/complejo asociado" },
        { status: 400 }
      )
    }

    const normalizedItems = normalizeCartItems(items).filter(
      (item) => item.quantity > 0 && item.unit_price >= 0
    )

    if (!normalizedItems.length) {
      return NextResponse.json(
        { error: "Carrito vacío" },
        { status: 400 }
      )
    }

    const subtotal = normalizedItems.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    if (subtotal < 20000) {
      return NextResponse.json(
        { error: "El pedido mínimo es de $20.000" },
        { status: 400 }
      )
    }

    const userId = await getOrCreateCommercialUser({
      customer_email,
      customer_name,
      customer_phone
    })

    const { data: activeCycleId, error: cycleError } = await supabase
      .rpc("ensure_active_commercial_cycle", {
        p_cluster_id: clusterLocationId
      })

    if (cycleError || !activeCycleId) {
      console.error("active cycle error", cycleError)
      return NextResponse.json(
        { error: "No se pudo asignar el ciclo comercial" },
        { status: 500 }
      )
    }

     const { data: loyaltyRow, error: loyaltyRowError } = await supabase
      .from("commercial_customer_loyalty")
      .select("completed_purchases")
      .eq("user_id", userId)
      .eq("cluster_location_id", clusterLocationId)
      .maybeSingle()

    if (loyaltyRowError) {
      console.error("loyalty row error", loyaltyRowError)
    }

    const completedPurchases = Number(loyaltyRow?.completed_purchases || 0)
    const firstPurchaseDiscountPercent = completedPurchases <= 0 ? 10 : 0

    const { data: loyaltyDiscountRaw, error: loyaltyError } = await supabase
      .rpc("get_customer_commercial_discount", {
        p_user_id: userId,
        p_cluster_location_id: clusterLocationId
      })

    if (loyaltyError) {
      console.error("loyalty discount error", loyaltyError)
    }

    const loyaltyDiscountPercent = Math.max(
      0,
      Math.min(100, Number(loyaltyDiscountRaw || 0))
    )

    const { data: availableBenefits, error: benefitError } = await supabase
      .from("commercial_user_benefits")
      .select("id, discount_percent, created_at")
      .eq("user_id", userId)
      .eq("cluster_location_id", clusterLocationId)
      .eq("status", "available")
      .order("created_at", { ascending: true })
      .limit(1)

    if (benefitError) {
      console.error("available benefit error", benefitError)
    }

    const availableBenefit = availableBenefits?.[0] || null
    const benefitDiscountPercent = availableBenefit
      ? Math.max(0, Math.min(100, Number(availableBenefit.discount_percent || 0)))
      : 0

    const appliedDiscountPercent = Math.max(
      firstPurchaseDiscountPercent,
      loyaltyDiscountPercent,
      benefitDiscountPercent
    )

    const commercialBenefitId =
      availableBenefit?.id &&
      benefitDiscountPercent > firstPurchaseDiscountPercent &&
      benefitDiscountPercent >= loyaltyDiscountPercent
        ? availableBenefit.id
        : null

    const benefitStatus =
      commercialBenefitId
        ? "applied"
        : firstPurchaseDiscountPercent > 0 &&
            appliedDiscountPercent === firstPurchaseDiscountPercent &&
            firstPurchaseDiscountPercent >= loyaltyDiscountPercent &&
            firstPurchaseDiscountPercent >= benefitDiscountPercent
          ? "first_purchase"
          : appliedDiscountPercent > 0
            ? "applied"
            : "none"

    const discountAmount = Math.round(
      subtotal * (appliedDiscountPercent / 100)
    )

    const finalPrice = Math.max(0, subtotal - discountAmount + propina)

    const fullNotes = [
      `Edificio: ${location.name}`,
      `Piso: ${apartment_floor}`,
      `Depto: ${apartment_unit}`,
      propina > 0 ? `Propina: $${propina.toLocaleString("es-AR")}` : "",
      delivery_notes ? `Notas: ${delivery_notes}` : ""
    ]
      .filter(Boolean)
      .join(" | ")

    await supabase
      .from("addresses")
      .upsert(
        {
          user_id: userId,
          address: location.address || location.name,
          city: location.city || "",
          notes: fullNotes,
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
        source: "vecinos",
        status: initialStatus,
        payment_method,
        payment_status: initialPaymentStatus,

        subtotal_price: subtotal,
        base_price: subtotal,
        price: finalPrice,
        final_price: finalPrice,

        discount_percent: appliedDiscountPercent,
        discount_amount: discountAmount,
        loyalty_discount_percent: loyaltyDiscountPercent,
        loyalty_discount_amount:
          loyaltyDiscountPercent > 0
            ? Math.round(subtotal * (loyaltyDiscountPercent / 100))
            : 0,

               benefit_status: benefitStatus,

        propina,

        customer_name,
        customer_email: normalizeEmail(customer_email),
        customer_phone,

        delivery_address: location.address || location.name,
        delivery_city: location.city || "",
        delivery_notes: fullNotes,

        commercial_location_id,
        commercial_cycle_id: activeCycleId,
        commercial_benefit_id: commercialBenefitId,

        apartment_floor,
        apartment_unit
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

if (commercialBenefitId && payment_method === "cash") {
  const { error: markBenefitError } = await supabase
    .from("commercial_user_benefits")
    .update({
      status: "used",
      used_order_id: order.id,
      used_at: new Date().toISOString()
    })
    .eq("id", commercialBenefitId)
    .eq("status", "available")

  if (markBenefitError) {
    console.error("mark benefit used error", markBenefitError)
  }
}

    if (payment_method === "cash") {
      return NextResponse.json({
        ok: true,
        order_id: order.id,
        subtotal,
        discount_percent: appliedDiscountPercent,
        discount_amount: discountAmount,
        propina,
        final_price: finalPrice,
        redirect_to: `/success?order_id=${order.id}&order_number=${order.order_number}`
      })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!
    })

    const preference = new Preference(client)

    const mpItems = [
      {
        id: order.id,
        title: "Pedido Quintas y Granjas",
        quantity: 1,
        currency_id: "ARS",
        unit_price: finalPrice
      }
    ]

    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: customer_name,
          email: normalizeEmail(customer_email)
        },
        external_reference: order.id,
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
        back_urls: {
         success: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${order.id}&order_number=${order.order_number}`,
         failure: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${order.id}&order_number=${order.order_number}&payment=failure`,
         pending: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${order.id}&order_number=${order.order_number}&payment=pending`
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
      subtotal,
      discount_percent: appliedDiscountPercent,
      discount_amount: discountAmount,
      propina,
      final_price: finalPrice,
      init_point: result.init_point
    })
  } catch (error: any) {
    console.error("vecinos checkout create error", error)
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
