import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import MercadoPagoConfig, { Payment } from "mercadopago"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    let nextStatus = "pending_payment"
    let nextPaymentStatus = mpStatus || "pending"

    if (mpStatus === "approved") {
      nextStatus = "confirmed"
      nextPaymentStatus = "approved"
    } else if (
      mpStatus === "rejected" ||
      mpStatus === "cancelled" ||
      mpStatus === "refunded" ||
      mpStatus === "charged_back"
    ) {
      nextStatus = "cancelled"
      nextPaymentStatus = mpStatus
    } else {
      nextStatus = "pending_payment"
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
