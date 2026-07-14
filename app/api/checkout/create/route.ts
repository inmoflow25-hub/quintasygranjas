import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import MercadoPagoConfig, { Preference } from "mercadopago"
import { createHash } from "crypto"
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

type PreviousOrderRow = {
  id: string
  user_id: string | null
  customer_email: string | null
  customer_phone: string | null
  payment_method: string | null
  payment_status: string | null
  status: string | null
  is_test: boolean | null
}

type AppContext = "web" | "pwa"

type Attribution = {
  affiliate_slug: string | null
  campaign_source: string | null
  landing_path: string | null
  attribution_label: string | null
  affiliate_discount_percent: number
}

type RedemptionQuote = {
  points_requested: number
  raw_discount: number
  max_allowed_discount: number
  applied_discount: number
  points_needed_for_applied_discount: number
}

function normalizeMoney(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0
  }

  return Math.round(numberValue)
}

function normalizePoints(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0
  }

  return Math.floor(numberValue)
}

function normalizeAppContext(value: unknown): AppContext {
  return value === "pwa" ? "pwa" : "web"
}

function normalizeText(value: unknown) {
  return String(value || "").trim()
}

function normalizeSlug(value: unknown) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
}

function getAttribution(body: any): Attribution {
  const affiliateSlug = normalizeSlug(body.affiliate_slug)

  if (affiliateSlug === "candela-baez") {
    return {
      affiliate_slug: "candela-baez",
      campaign_source: normalizeText(body.campaign_source) || "influencer",
      landing_path: normalizeText(body.landing_path) || "/candela-baez",
      attribution_label: normalizeText(body.attribution_label) || "Candela Báez",
      affiliate_discount_percent: 10
    }
  }

  return {
    affiliate_slug: null,
    campaign_source: normalizeText(body.campaign_source) || null,
    landing_path: normalizeText(body.landing_path) || null,
    attribution_label: normalizeText(body.attribution_label) || null,
    affiliate_discount_percent: 0
  }
}

function isUuid(value: string | null | undefined) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value || "")
  )
}

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

function formatMoney(value: number) {
  return `$${Math.round(value || 0).toLocaleString("es-AR")}`
}

function formatPaymentMethod(paymentMethod: string) {
  if (paymentMethod === "cash") return "Efectivo"
  if (paymentMethod === "mercadopago") return "Mercado Pago"
  if (paymentMethod === "mp_transfer") return "Transferencia"
  return paymentMethod || "No informado"
}

function normalizeCartItems(items: CheckoutItem[]) {
  return items.map((item) => ({
    id: String(item.id || item.product_name || item.name || crypto.randomUUID()),
    title: item.name || item.product_name || "Producto",
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.price || 0)
  }))
}

function isValidConfirmedOrder(order: PreviousOrderRow) {
  if (order.status !== "confirmed") return false
  if (order.is_test === true) return false

  if (order.payment_method === "mercadopago") {
    return ["approved", "paid"].includes(String(order.payment_status || ""))
  }

  return true
}

async function getCompletedPurchasesForCustomer({
  userId,
  email,
  phone,
  excludeOrderId
}: {
  userId: string
  email: string
  phone: string
  excludeOrderId?: string | null
}) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      customer_email,
      customer_phone,
      payment_method,
      payment_status,
      status,
      is_test
    `)
    .eq("status", "confirmed")

  if (error) {
    console.error("completed purchases lookup error", error)
    throw new Error("No se pudo calcular el beneficio del cliente")
  }

  const matchedOrders = (orders || []).filter((order: PreviousOrderRow) => {
    if (excludeOrderId && order.id === excludeOrderId) return false
    if (!isValidConfirmedOrder(order)) return false

    const orderEmail = normalizeEmail(order.customer_email)
    const orderPhone = normalizeArgentinaPhone(order.customer_phone)

    return (
      order.user_id === userId ||
      (!!email && orderEmail === email) ||
      (!!phone && orderPhone === phone)
    )
  })

  return matchedOrders.length
}

function getIndividualDiscount({
  completedPurchases
}: {
  completedPurchases: number
}) {
  const nextPurchaseNumber = completedPurchases + 1
  const isFirstPurchase = nextPurchaseNumber === 1
  const isFourthPurchaseCycle = nextPurchaseNumber % 4 === 0

  if (isFirstPurchase) {
    return {
      discountPercent: 10,
      benefitStatus: "first_purchase",
      loyaltyDiscountPercent: 0
    }
  }

  if (isFourthPurchaseCycle) {
    return {
      discountPercent: 10,
      benefitStatus: "loyalty_4_cycle",
      loyaltyDiscountPercent: 10
    }
  }

  return {
    discountPercent: 0,
    benefitStatus: "none",
    loyaltyDiscountPercent: 0
  }
}

async function getAvailablePoints(userId: string) {
  const { data, error } = await supabase
    .from("user_points_app_summary")
    .select("available_points")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("available points lookup error", error)
    throw new Error("No se pudieron consultar los puntos disponibles")
  }

  return Number(data?.available_points || 0)
}

async function calculateRedemptionQuote({
  pointsToSpend,
  subtotal
}: {
  pointsToSpend: number
  subtotal: number
}): Promise<RedemptionQuote> {
  if (pointsToSpend <= 0) {
    return {
      points_requested: 0,
      raw_discount: 0,
      max_allowed_discount: 0,
      applied_discount: 0,
      points_needed_for_applied_discount: 0
    }
  }

  const { data, error } = await supabase.rpc(
    "calculate_points_redemption_discount",
    {
      p_points_to_spend: pointsToSpend,
      p_subtotal: subtotal
    }
  )

  if (error) {
    console.error("redemption quote error", error)
    throw new Error("No se pudo calcular el descuento por puntos")
  }

  const quote = Array.isArray(data) ? data[0] : data

  return {
    points_requested: Number(quote?.points_requested || 0),
    raw_discount: Number(quote?.raw_discount || 0),
    max_allowed_discount: Number(quote?.max_allowed_discount || 0),
    applied_discount: Number(quote?.applied_discount || 0),
    points_needed_for_applied_discount: Number(
      quote?.points_needed_for_applied_discount || 0
    )
  }
}

async function processConfirmedOrderPoints(orderId: string) {
  const { data, error } = await supabase.rpc("process_confirmed_order_points", {
    p_order_id: orderId
  })

  if (error) {
    console.error("process confirmed order points error", error)
    throw new Error("No se pudieron procesar los puntos del pedido")
  }

  return data
}

function buildItemsSummary(
  items: Array<{
    title: string
    quantity: number
    unit_price: number
  }>
) {
  return items
    .map((item) => `• ${item.title} x${Number(item.quantity || 1)}`)
    .join("\n")
}

function buildCycleProgress({
  completedPurchasesBeforeOrder,
  benefitStatus,
  discountPercent
}: {
  completedPurchasesBeforeOrder: number
  benefitStatus: string
  discountPercent: number
}) {
  const cyclePosition = String((completedPurchasesBeforeOrder % 4) + 1)

  if (cyclePosition === "1") {
    if (benefitStatus === "first_purchase" && discountPercent > 0) {
      return {
        cyclePosition,
        cycleBenefitMessage:
          "Esta fue tu compra 1 de 4. Además, en este pedido recibiste tu 10% de bienvenida."
      }
    }

    return {
      cyclePosition,
      cycleBenefitMessage:
        "Esta fue tu compra 1 de 4. En la compra 4 accedés a un 10% de descuento."
    }
  }

  if (cyclePosition === "2") {
    return {
      cyclePosition,
      cycleBenefitMessage:
        "Ya vas por la compra 2 de 4. Estás a 2 compras de tu 10% de descuento."
    }
  }

  if (cyclePosition === "3") {
    return {
      cyclePosition,
      cycleBenefitMessage:
        "Ya vas por la compra 3 de 4. En tu próxima compra accedés al 10% de descuento."
    }
  }

  return {
    cyclePosition,
    cycleBenefitMessage:
      "¡Esta fue tu compra 4 y ya recibiste tu 10% de descuento en este pedido!"
  }
}

async function sendPostPurchaseTemplate({
  orderId,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  itemsSummary,
  totalFormatted,
  paymentMethodLabel,
  cyclePosition,
  cycleBenefitMessage,
  deliveryAddress,
  deliveryCity
}: {
  orderId: string
  orderNumber: string | number
  customerName: string
  customerEmail: string
  customerPhone: string
  itemsSummary: string
  totalFormatted: string
  paymentMethodLabel: string
  cyclePosition: string
  cycleBenefitMessage: string
  deliveryAddress: string
  deliveryCity: string
}) {
  const webhookUrl = process.env.GHL_POST_PURCHASE_TEMPLATE_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("GHL_POST_PURCHASE_TEMPLATE_WEBHOOK_URL no configurado")
    return
  }

  const payload = {
    order_id: orderId,
    order_number: String(orderNumber),
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    items_summary: itemsSummary,
    order_detail_message: itemsSummary,
    total_formatted: totalFormatted,
    payment_method_label: paymentMethodLabel,
    cycle_position: cyclePosition,
    cycle_benefit_message: cycleBenefitMessage,
    delivery_address: deliveryAddress,
    delivery_city: deliveryCity
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      console.error("post purchase template webhook error", response.status, text)
    }
  } catch (error) {
    console.error("post purchase template fetch error", error)
  }
}

async function syncConfirmedOrderToGhl({
  orderId,
  orderNumber,
  userId,
  customerName,
  customerEmail,
  customerPhone,
  value,
  source,
  status,
  paymentStatus,
  paymentMethod,
  boxId,
  createdAt
}: {
  orderId: string
  orderNumber: string | number | null
  userId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  value: number
  source: string
  status: string
  paymentStatus: string
  paymentMethod: string
  boxId: string | null
  createdAt: string
}) {
  const ghlWebhookUrl = process.env.GHL_ORDER_WEBHOOK_URL

  if (!ghlWebhookUrl) {
    console.warn("GHL_ORDER_WEBHOOK_URL no configurado")
    return
  }

  const payload = {
    order_id: orderId,
    order_number: orderNumber ?? null,
    user_id: userId ?? null,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    value: Number(value || 0),
    price: Number(value || 0),
    source: source || "web_app",
    status,
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    order_type: boxId ? "box" : "cart",
    box_id: boxId ?? null,
    created_at: createdAt,
    event_time: Math.floor(Date.now() / 1000)
  }

  try {
    const response = await fetch(ghlWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      console.error("ghl confirmed order sync error", response.status, text)
    }
  } catch (error) {
    console.error("ghl confirmed order sync fetch error", error)
  }
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

function normalizeMetaPhone(phone: string) {
  return String(phone || "").replace(/\D/g, "")
}

async function sendPurchaseEventToMeta({
  orderId,
  userId,
  customerEmail,
  customerPhone,
  value,
  source
}: {
  orderId: string
  userId: string | null
  customerEmail: string
  customerPhone: string
  value: number
  source: string
}) {
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN
  const datasetId = process.env.META_DATASET_ID || "899097899619057"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://quintasygranjas.com"

  if (!accessToken) {
    console.warn("META_PAGE_ACCESS_TOKEN no configurado")
    return
  }

  if (!datasetId) {
    console.warn("META_DATASET_ID no configurado")
    return
  }

  const normalizedEmail = normalizeEmail(customerEmail)
  const normalizedPhone = normalizeMetaPhone(customerPhone)

  const payload: any = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: orderId,
        action_source: "website",
        event_source_url: `${baseUrl}/checkout`,
        user_data: {
          em: normalizedEmail ? [sha256(normalizedEmail)] : [],
          ph: normalizedPhone ? [sha256(normalizedPhone)] : [],
          external_id: userId ? [sha256(String(userId))] : []
        },
        custom_data: {
          currency: "ARS",
          value: Number(value || 0),
          order_id: orderId,
          source: source || "web_app"
        }
      }
    ]
  }

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${datasetId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    )

    const resultText = await response.text().catch(() => "")

    if (!response.ok) {
      console.error("meta capi error", response.status, resultText)
      return
    }

    console.log("meta capi ok", resultText)
  } catch (error) {
    console.error("meta capi fetch error", error)
  }
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

   const appContext = normalizeAppContext(body.app_context)
const attribution = getAttribution(body)
const isAffiliateOrder = Boolean(attribution.affiliate_slug)

const requestedPointsToSpend =
  appContext === "pwa" && !isAffiliateOrder
    ? normalizePoints(body.points_to_spend)
    : 0

    const propina = normalizeMoney(body.propina)
    const normalizedCustomerEmail = normalizeEmail(customer_email)
    const normalizedCustomerPhone = normalizeArgentinaPhone(customer_phone)

    if (
      !customer_name ||
      !normalizedCustomerEmail ||
      !normalizedCustomerPhone ||
      !delivery_address ||
      !delivery_city
    ) {
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

    if (!userId) {
      return NextResponse.json(
        { error: "No se pudo identificar el usuario" },
        { status: 500 }
      )
    }

    const completedPurchasesBeforeOrder = await getCompletedPurchasesForCustomer({
      userId,
      email: normalizedCustomerEmail,
      phone: normalizedCustomerPhone
    })

   const individualDiscount = getIndividualDiscount({
  completedPurchases: completedPurchasesBeforeOrder
})

const affiliateDiscountPercent = attribution.affiliate_discount_percent

const discountPercent = Math.max(
  individualDiscount.discountPercent,
  affiliateDiscountPercent
)

const benefitStatus =
  affiliateDiscountPercent > individualDiscount.discountPercent
    ? `affiliate_${attribution.affiliate_slug}`
    : individualDiscount.benefitStatus

const loyaltyDiscountPercent =
  individualDiscount.loyaltyDiscountPercent > 0 &&
  individualDiscount.discountPercent >= affiliateDiscountPercent
    ? individualDiscount.loyaltyDiscountPercent
    : 0

const discountAmount = Math.round(subtotal * (discountPercent / 100))

const loyaltyDiscountAmount =
  loyaltyDiscountPercent > 0
    ? Math.round(subtotal * (loyaltyDiscountPercent / 100))
    : 0

const affiliateDiscountAmount =
  affiliateDiscountPercent > 0
    ? Math.round(subtotal * (affiliateDiscountPercent / 100))
    : 0

    let availablePoints = 0
    let pointsToSpend = 0
    let rewardDiscountAmount = 0
    let rewardDescription: string | null = null
    let redemptionQuote: RedemptionQuote | null = null

    if (appContext === "pwa" && requestedPointsToSpend > 0) {
      availablePoints = await getAvailablePoints(userId)

      if (availablePoints <= 0) {
        return NextResponse.json(
          { error: "No tenés puntos disponibles para usar" },
          { status: 400 }
        )
      }

      const pointsForQuote = Math.min(requestedPointsToSpend, availablePoints)

      redemptionQuote = await calculateRedemptionQuote({
        pointsToSpend: pointsForQuote,
        subtotal
      })

      pointsToSpend = redemptionQuote.points_needed_for_applied_discount
      rewardDiscountAmount = Math.round(redemptionQuote.applied_discount)

      if (pointsToSpend > availablePoints) {
        return NextResponse.json(
          { error: "No tenés puntos suficientes para este canje" },
          { status: 400 }
        )
      }

      if (rewardDiscountAmount <= 0 || pointsToSpend <= 0) {
        return NextResponse.json(
          { error: "No se pudo aplicar descuento con puntos" },
          { status: 400 }
        )
      }

      rewardDescription = `Canje de ${pointsToSpend} puntos por ${formatMoney(
        rewardDiscountAmount
      )} de descuento`
    }

    const finalPrice = subtotal - discountAmount - rewardDiscountAmount + propina

    if (finalPrice <= 0) {
      return NextResponse.json(
        { error: "No se permite confirmar un pedido gratis" },
        { status: 400 }
      )
    }

    await supabase
      .from("profiles")
      .upsert({
        id: userId,
        name: customer_name,
        full_name: customer_name,
        email: normalizedCustomerEmail,
        phone: normalizedCustomerPhone,
        address: delivery_address,
        city: delivery_city
      })

    const fullNotes = [
      delivery_notes || "",
      `Domicilio: ${delivery_address}`,
      payment_method === "mp_transfer"
        ? `Pago por transferencia MP. Alias: ${process.env.NEXT_PUBLIC_MP_ALIAS || ""}`
        : "",
      propina > 0 ? `Propina: ${formatMoney(propina)}` : "",
      discountPercent > 0
  ? `Descuento aplicado: ${discountPercent}% (${benefitStatus})`
  : "",
attribution.affiliate_slug
  ? `Proveniencia: ${attribution.attribution_label} (${attribution.affiliate_slug})`
  : "",
      rewardDiscountAmount > 0 && rewardDescription
        ? `Puntos aplicados: ${rewardDescription}`
        : ""
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

    const initialStatus = "confirmed"

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
app_context: appContext,

affiliate_slug: attribution.affiliate_slug,
campaign_source: attribution.campaign_source,
landing_path: attribution.landing_path,
attribution_label: attribution.attribution_label,
affiliate_discount_percent: affiliateDiscountPercent,
affiliate_discount_amount: affiliateDiscountAmount,

        status: initialStatus,
        payment_method,
        payment_status: initialPaymentStatus,

        subtotal_price: subtotal,
        base_price: subtotal,
        price: finalPrice,
        final_price: finalPrice,

        discount_percent: discountPercent,
        discount_amount: discountAmount,
        loyalty_discount_percent: loyaltyDiscountPercent,
        loyalty_discount_amount: loyaltyDiscountAmount,

        reward_discount_amount: rewardDiscountAmount,
        reward_description: rewardDescription,
        points_spent: pointsToSpend,
        points_processed: isAffiliateOrder ? true : false,
        benefit_status: benefitStatus,
        propina,

        customer_name,
        customer_email: normalizedCustomerEmail,
        customer_phone: normalizedCustomerPhone,
        delivery_address,
        delivery_city,
        delivery_notes: fullNotes
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
  product_id: isUuid(item.id) ? item.id : null,
  product_name: item.title,
  quantity: item.quantity,
  price: item.unit_price,
  source_type: "product"
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

    let pointsProcessingResult: any = null

    if (initialStatus === "confirmed") {
      try {
        pointsProcessingResult = await processConfirmedOrderPoints(order.id)
      } catch (error) {
        console.error("points processing failed", error)

        if (pointsToSpend > 0) {
          return NextResponse.json(
            { error: "No se pudo aplicar el canje de puntos" },
            { status: 500 }
          )
        }
      }
    }

    const { cyclePosition, cycleBenefitMessage } = buildCycleProgress({
      completedPurchasesBeforeOrder,
      benefitStatus,
      discountPercent
    })

    const itemsSummary = buildItemsSummary(normalizedItems)
    const totalFormatted = formatMoney(finalPrice)
    const paymentMethodLabel = formatPaymentMethod(payment_method)

    if (payment_method === "cash" || payment_method === "mp_transfer") {
      await sendPostPurchaseTemplate({
        orderId: order.id,
        orderNumber: order.order_number || order.id,
        customerName: customer_name,
        customerEmail: normalizedCustomerEmail,
        customerPhone: normalizedCustomerPhone,
        itemsSummary,
        totalFormatted,
        paymentMethodLabel,
        cyclePosition,
        cycleBenefitMessage,
        deliveryAddress: delivery_address,
        deliveryCity: delivery_city
      })
    }

    if (initialStatus === "confirmed") {
      await syncConfirmedOrderToGhl({
        orderId: order.id,
        orderNumber: order.order_number || order.id,
        userId,
        customerName: customer_name,
        customerEmail: normalizedCustomerEmail,
        customerPhone: normalizedCustomerPhone,
        value: finalPrice,
        source,
        status: initialStatus,
        paymentStatus: initialPaymentStatus,
        paymentMethod: payment_method,
        boxId: source === "box" ? box_id : null,
        createdAt: order.created_at
      })

      await sendPurchaseEventToMeta({
        orderId: order.id,
        userId,
        customerEmail: normalizedCustomerEmail,
        customerPhone: normalizedCustomerPhone,
        value: finalPrice,
        source
      })
    }

    const baseResponse = {
      ok: true,
      order_id: order.id,
      subtotal,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      reward_discount_amount: rewardDiscountAmount,
      reward_description: rewardDescription,
      points_spent: pointsToSpend,
      points_processing_result: pointsProcessingResult,
      redemption_quote: redemptionQuote,
      app_context: appContext,
      propina,
      final_price: finalPrice,
      completed_purchases_before_order: completedPurchasesBeforeOrder,
      cycle_position: cyclePosition,
      cycle_benefit_message: cycleBenefitMessage
    }

    if (payment_method === "cash" || payment_method === "mp_transfer") {
      return NextResponse.json({
        ...baseResponse,
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
      ...baseResponse,
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
