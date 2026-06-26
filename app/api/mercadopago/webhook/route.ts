import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import MercadoPagoConfig, { Payment } from "mercadopago"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

function buildItemsSummary(
  items: Array<{
    product_name: string | null
    quantity: number | null
  }>
) {
  return items
    .map((item) => `• ${String(item.product_name || "Producto")} x${Number(item.quantity || 1)}`)
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

async function markUsedBenefits(orderId: string) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, benefit_status, commercial_benefit_id")
    .eq("id", orderId)
    .maybeSingle()

  if (orderError || !order) {
    console.error("benefit order lookup error", orderError)
    return
  }

  await supabase
    .from("user_benefits")
    .update({
      status: "used",
      used_order_id: orderId,
      used_at: new Date().toISOString()
    })
    .eq("used_order_id", orderId)
    .neq("status", "used")

  if (order.commercial_benefit_id) {
    await supabase
      .from("commercial_user_benefits")
      .update({
        status: "used",
        used_order_id: orderId,
        used_at: new Date().toISOString()
      })
      .eq("id", order.commercial_benefit_id)
      .eq("status", "available")
  }

  if (order.benefit_status === "used" || order.benefit_status === "applied") {
    await supabase
      .from("user_benefits")
      .update({
        status: "used",
        used_order_id: orderId,
        used_at: new Date().toISOString()
      })
      .eq("used_order_id", orderId)
      .eq("status", "available")
  }
}

async function syncConfirmedOrderToGhl(orderId: string) {
  const ghlWebhookUrl = process.env.GHL_ORDER_WEBHOOK_URL

  if (!ghlWebhookUrl) {
    console.warn("GHL_ORDER_WEBHOOK_URL no configurado")
    return
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      price,
      final_price,
      source,
      status,
      payment_status,
      payment_method,
      box_id,
      created_at
    `)
    .eq("id", orderId)
    .maybeSingle()

  if (orderError || !order) {
    console.error("ghl sync order lookup error", orderError)
    return
  }

  const payload = {
    order_id: order.id,
    order_number: order.order_number ?? null,
    user_id: order.user_id ?? null,

    customer_name: order.customer_name ?? "",
    customer_email: order.customer_email ?? "",
    customer_phone: order.customer_phone ?? "",

    value: Number(order.final_price ?? order.price ?? 0),
    price: Number(order.final_price ?? order.price ?? 0),

    source: order.source || "web_app",
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method,

    order_type: order.box_id ? "box" : "cart",
    box_id: order.box_id ?? null,

    created_at: order.created_at,
    event_time: Math.floor(Date.now() / 1000)
  }

  try {
    const ghlRes = await fetch(ghlWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!ghlRes.ok) {
      const text = await ghlRes.text().catch(() => "")
      console.error("ghl order sync error", ghlRes.status, text)
    }
  } catch (error) {
    console.error("ghl order sync fetch error", error)
  }
}

async function processWebhook(request: NextRequest) {
  try {
    const url = new URL(request.url)

    const topic =
      url.searchParams.get("topic") ||
      url.searchParams.get("type")

    const paymentId =
      url.searchParams.get("id") ||
      url.searchParams.get("data.id")

    if (topic !== "payment" || !paymentId) {
      return NextResponse.json({ ok: true })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!
    })

    const payment = new Payment(client)
    const paymentData: any = await payment.get({ id: paymentId })

    const orderId = paymentData?.external_reference

    if (!orderId) {
      return NextResponse.json({ ok: true })
    }

    const { data: previousOrder, error: previousOrderError } = await supabase
      .from("orders")
      .select("id, status, payment_status")
      .eq("id", orderId)
      .maybeSingle()

    if (previousOrderError) {
      console.error("previous order lookup error", previousOrderError)
    }

    const mpStatus = String(paymentData?.status || "").toLowerCase()

    const nextStatus = "confirmed"
    let nextPaymentStatus = mpStatus || "pending"

    if (mpStatus === "approved") {
      nextPaymentStatus = "approved"
    } else if (
      mpStatus === "rejected" ||
      mpStatus === "cancelled" ||
      mpStatus === "refunded" ||
      mpStatus === "charged_back"
    ) {
      nextPaymentStatus = mpStatus
    } else {
      nextPaymentStatus = mpStatus || "pending"
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: nextStatus,
        payment_status: nextPaymentStatus,
        mp_payment_id: String(paymentData?.id || paymentId),
        payment_method: "mercadopago"
      })
      .eq("id", orderId)

    if (error) {
      console.error("webhook update error", error)
      return NextResponse.json({ error: "db error" }, { status: 500 })
    }

    const wasAlreadyConfirmed =
      previousOrder?.status === "confirmed" &&
      String(previousOrder?.payment_status || "").toLowerCase() === "approved"

    if (mpStatus === "approved") {
      await markUsedBenefits(orderId)

      if (!wasAlreadyConfirmed) {
        await syncConfirmedOrderToGhl(orderId)

        const { data: order, error: orderLookupError } = await supabase
          .from("orders")
          .select(`
            id,
            order_number,
            user_id,
            customer_name,
            customer_email,
            customer_phone,
            payment_method,
            discount_percent,
            benefit_status,
            final_price,
            price,
            delivery_address,
            delivery_city
          `)
          .eq("id", orderId)
          .maybeSingle()

        if (orderLookupError || !order) {
          console.error("post purchase order lookup error", orderLookupError)
        } else {
          const { data: orderItems, error: orderItemsError } = await supabase
            .from("order_items")
            .select("product_name, quantity")
            .eq("order_id", orderId)

          if (orderItemsError) {
            console.error("post purchase order items lookup error", orderItemsError)
          }

          const completedPurchasesBeforeOrder = await getCompletedPurchasesForCustomer({
            userId: String(order.user_id || ""),
            email: normalizeEmail(order.customer_email),
            phone: normalizeArgentinaPhone(order.customer_phone),
            excludeOrderId: orderId
          })

          const { cyclePosition, cycleBenefitMessage } = buildCycleProgress({
            completedPurchasesBeforeOrder,
            benefitStatus: String(order.benefit_status || "none"),
            discountPercent: Number(order.discount_percent || 0)
          })

          const itemsSummary = buildItemsSummary(orderItems || [])
          const totalFormatted = formatMoney(Number(order.final_price ?? order.price ?? 0))
          const paymentMethodLabel = formatPaymentMethod("mercadopago")

          await sendPostPurchaseTemplate({
            orderId: order.id,
            orderNumber: order.order_number || order.id,
            customerName: String(order.customer_name || ""),
            customerEmail: String(order.customer_email || ""),
            customerPhone: String(order.customer_phone || ""),
            itemsSummary,
            totalFormatted,
            paymentMethodLabel,
            cyclePosition,
            cycleBenefitMessage,
            deliveryAddress: String(order.delivery_address || ""),
            deliveryCity: String(order.delivery_city || "")
          })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("mp webhook error", error)
    return NextResponse.json({ error: "webhook error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return processWebhook(request)
}

export async function GET(request: NextRequest) {
  return processWebhook(request)
}


