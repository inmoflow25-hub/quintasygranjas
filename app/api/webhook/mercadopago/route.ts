import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id

    if (!paymentId) {
      return NextResponse.json(
        { error: "missing payment id" },
        { status: 400 }
      )
    }

    const payment = new Payment(mp)
    const paymentInfo = await payment.get({ id: paymentId })

    if (!paymentInfo) {
      return NextResponse.json(
        { error: "payment not found" },
        { status: 404 }
      )
    }

    if (paymentInfo.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const userId = paymentInfo.external_reference

    if (!userId) {
      return NextResponse.json(
        { error: "missing external_reference" },
        { status: 400 }
      )
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (orderError) {
      return NextResponse.json(
        { error: "order lookup failed" },
        { status: 500 }
      )
    }

    if (!order) {
      return NextResponse.json(
        { error: "order not found" },
        { status: 404 }
      )
    }

    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        mp_payment_id: String(paymentId)
      })
      .eq("id", order.id)

    if (updateOrderError) {
      return NextResponse.json(
        { error: "failed to update order" },
        { status: 500 }
      )
    }

    const startDate = new Date()
    const nextCharge = new Date()
    nextCharge.setMonth(nextCharge.getMonth() + 1)

    const planValue = order.box || order.box_type || "Caja"

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: order.user_id,
        plan: planValue,
        box: planValue,
        active: true,
        start_date: startDate.toISOString(),
        next_charge: nextCharge.toISOString(),
        mp_subscription_id: null
      })
      .select()
      .single()

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: "failed to create subscription" },
        { status: 500 }
      )
    }

    const deliveries = []

    for (let i = 0; i < 4; i++) {
      const deliveryDate = new Date(startDate)
      deliveryDate.setDate(deliveryDate.getDate() + i * 7)

      deliveries.push({
        subscription_id: subscription.id,
        user_id: order.user_id,
        delivery_date: deliveryDate.toISOString().split("T")[0],
        status: "pending"
      })
    }

    const { error: deliveriesError } = await supabase
      .from("deliveries")
      .insert(deliveries)

    if (deliveriesError) {
      return NextResponse.json(
        { error: "failed to create deliveries" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)

    return NextResponse.json(
      { error: "webhook error" },
      { status: 500 }
    )
  }
}
