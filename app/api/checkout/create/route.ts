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

function normalizeMoney(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0
  }

  return Math.round(numberValue)
}

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

function normalizeArgentinaPhone(rawPhone: string) {
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


function normalizeText(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function normalizeCartItems(items: CheckoutItem[]) {
  return items.map((item) => ({
    id: String(item.id || item.product_name || item.name || crypto.randomUUID()),
    title: item.name || item.product_name || "Producto",
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.price || 0)
  }))
}

function buildCustomerLocationSlug(address: string, city: string) {
  const slug = normalizeText(`${address}-${city}`)

  if (slug) return `dom-${slug}`

  return `domicilio-${crypto.randomUUID()}`
}

function normalizeOptionalNumber(value: unknown) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return null
  }

  return numberValue
}

async function getOrCreateCustomerAddressLocation({
  delivery_address,
  delivery_city,
  google_place_id,
  lat,
  lng
}: {
  delivery_address: string
  delivery_city: string
  google_place_id?: string | null
  lat?: number | null
  lng?: number | null
}) {
  const cleanPlaceId = String(google_place_id || "").trim() || null
  const address = String(delivery_address || "").trim()
  const city = String(delivery_city || "").trim()

  if (cleanPlaceId) {
    const { data: existingByPlaceId, error: existingByPlaceIdError } = await supabase
      .from("commercial_locations")
      .select("id, slug")
      .eq("google_place_id", cleanPlaceId)
      .maybeSingle()

    if (existingByPlaceIdError) {
      console.error("find location by place id error", existingByPlaceIdError)
    }

    if (existingByPlaceId?.id) {
      return existingByPlaceId.id as string
    }
  }

  const slug = buildCustomerLocationSlug(address, city)

  const { data: existingBySlug, error: existingBySlugError } = await supabase
    .from("commercial_locations")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle()

  if (existingBySlugError) {
    console.error("find location by slug error", existingBySlugError)
  }

  if (existingBySlug?.id) {
    if (cleanPlaceId) {
      await supabase
        .from("commercial_locations")
        .update({
          google_place_id: cleanPlaceId,
          lat,
          lng,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingBySlug.id)
        .is("google_place_id", null)
    }

    return existingBySlug.id as string
  }

  const { data: createdLocation, error: createLocationError } = await supabase
    .from("commercial_locations")
    .insert({
      slug,
      name: address,
      type: "cluster",
      address,
      city,
      google_place_id: cleanPlaceId,
      lat,
      lng,
      is_active: true,
      benefit_threshold_amount: 300000,
      benefit_threshold_orders: 10,
      benefit_discount_percent: 5,
      benefit_status: "none",
      cycle_auto_close: true,
      cycle_timezone: "America/Argentina/Buenos_Aires",
      cycle_close_weekday: 5,
      cycle_close_time: "20:00:00",
      delivery_weekday: 5
    })
    .select("id")
    .single()

  if (createLocationError || !createdLocation?.id) {
    console.error("create customer address location error", createLocationError)
    throw new Error("No se pudo crear la comunidad del domicilio")
  }

  return createdLocation.id as string
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

    const propina = normalizeMoney(body.propina)
    const googlePlaceId = String(body.google_place_id || "").trim()
    const lat = normalizeOptionalNumber(body.lat)
    const lng = normalizeOptionalNumber(body.lng)
    const normalizedCustomerEmail = normalizeEmail(customer_email)
    const normalizedCustomerPhone = normalizeArgentinaPhone(customer_phone)

    if (!customer_name || !normalizedCustomerEmail || !normalizedCustomerPhone || !delivery_address || !delivery_city) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios del receptor" },
        { status: 400 }
      )
    }

    if (
      payment_method !== "mercadopago" &&
      payment_method !== "cash" &&
      payment_method !== "mp_transfer"
    ) {
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

    const subtotal = normalizedItems.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    if (subtotal <= 0) {
      return NextResponse.json(
        { error: "Total inválido" },
        { status: 400 }
      )
    }

    if (subtotal < 20000) {
      return NextResponse.json(
        { error: "El pedido mínimo es de $20.000" },
        { status: 400 }
      )
    }

    let userId: string | null = null

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", normalizedCustomerEmail)
      .maybeSingle()

    if (existingUser?.id) {
      userId = existingUser.id
    } else {
      const newUserId = crypto.randomUUID()

      const { data: createdUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          id: newUserId,
          email: normalizedCustomerEmail,
          name: customer_name
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

    const commercialLocationId = await getOrCreateCustomerAddressLocation({
      delivery_address,
      delivery_city,
      google_place_id: googlePlaceId,
      lat,
      lng
    })

    const { data: activeCycleId, error: cycleError } = await supabase
      .rpc("ensure_active_commercial_cycle", {
        p_cluster_id: commercialLocationId
      })

    if (cycleError || !activeCycleId) {
      console.error("active cycle error", cycleError)
      return NextResponse.json(
        { error: "No se pudo asignar el ciclo del domicilio" },
        { status: 500 }
      )
    }

    const { data: loyaltyRow, error: loyaltyRowError } = await supabase
      .from("commercial_customer_loyalty")
      .select("completed_purchases")
      .eq("user_id", userId)
      .eq("cluster_location_id", commercialLocationId)
      .maybeSingle()

    if (loyaltyRowError) {
      console.error("loyalty row error", loyaltyRowError)
    }

    const completedPurchases = Number(loyaltyRow?.completed_purchases || 0)
    const firstPurchaseDiscountPercent = completedPurchases <= 0 ? 10 : 0

    const { data: loyaltyDiscountRaw, error: loyaltyError } = await supabase
      .rpc("get_customer_commercial_discount", {
        p_user_id: userId,
        p_cluster_location_id: commercialLocationId
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
      .eq("cluster_location_id", commercialLocationId)
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

    await supabase
      .from("profiles")
      .upsert({
        id: userId,
        name: customer_name,
        full_name: customer_name,
        email: normalizedCustomerEmail,
        phone: normalizedCustomerPhone
        address: delivery_address,
        city: delivery_city
      })

    const fullNotes = [
      delivery_notes || "",
      `Domicilio comunidad: ${delivery_address}`,
      googlePlaceId ? `Google place id: ${googlePlaceId}` : "",
      payment_method === "mp_transfer"
        ? `Pago por transferencia MP. Alias: ${process.env.NEXT_PUBLIC_MP_ALIAS || ""}`
        : "",
      propina > 0 ? `Propina: $${propina.toLocaleString("es-AR")}` : ""
    ]
      .filter(Boolean)
      .join(" | ")

    await supabase
      .from("addresses")
      .upsert(
        {
          user_id: userId,
          address: delivery_address,
          city: delivery_city,
          notes: fullNotes,
          phone: normalizedCustomerPhone
        },
        { onConflict: "user_id" }
      )

    const initialStatus =
      payment_method === "mercadopago" ? "pending_payment" : "confirmed"

    const initialPaymentStatus =
      payment_method === "cash"
        ? "pending_cash"
        : payment_method === "mp_transfer"
          ? "pending_transfer"
          : "pending"

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        box_id: source === "box" ? box_id : null,
        source,
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
        customer_email: normalizedCustomerEmail,
        customer_phone,
        delivery_address,
        delivery_city,
        delivery_notes: fullNotes,

        commercial_location_id: commercialLocationId,
        commercial_cycle_id: activeCycleId,
        commercial_benefit_id: commercialBenefitId
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

    if (commercialBenefitId && (payment_method === "cash" || payment_method === "mp_transfer")) {
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

    if (payment_method === "cash" || payment_method === "mp_transfer") {
      return NextResponse.json({
        ok: true,
        order_id: order.id,
        subtotal,
        discount_percent: appliedDiscountPercent,
        discount_amount: discountAmount,
        propina,
        final_price: finalPrice,
        commercial_location_id: commercialLocationId,
        commercial_cycle_id: activeCycleId,
        redirect_to: `/success?order_id=${order.id}&order_number=${order.order_number}&payment=${payment_method}`
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
          email: normalizedCustomerEmail
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
      commercial_location_id: commercialLocationId,
      commercial_cycle_id: activeCycleId,
      init_point: result.init_point
    })
  } catch (error: any) {
    console.error("checkout create error", error)
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
