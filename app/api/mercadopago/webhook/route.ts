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

    if (mpStatus === "approved") {
      await markUsedBenefits(orderId)
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
