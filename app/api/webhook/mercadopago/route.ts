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

    const rawBody = await req.text()

    let body: any

    try {
      body = JSON.parse(rawBody)
    } catch {
      body = Object.fromEntries(new URLSearchParams(rawBody))
    }

    if (!body.data?.id) {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data.id

    const payment = new Payment(mp)

    const paymentInfo = await payment.get({ id: paymentId })

    if (paymentInfo.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const userId = paymentInfo.external_reference

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle()

    if (!order) {

      console.log("ORDER NOT FOUND")

      return NextResponse.json({ ok: true })
    }

    await supabase
      .from("orders")
      .update({
        status: "paid",
        mp_payment_id: String(paymentId)
      })
      .eq("id", order.id)

    const startDate = new Date()

    const nextCharge = new Date()
    nextCharge.setMonth(nextCharge.getMonth() + 1)

    const { data: subscription } = await supabase
      .from("subscriptions")
      .insert({
        user_id: order.user_id,
        plan: "monthly",
        box: "active",
        active: true,
        start_date: startDate.toISOString(),
        next_charge: nextCharge.toISOString()
      })
      .select()
      .single()

    const deliveries = []

    for (let i = 0; i < 4; i++) {

      const d = new Date(startDate)
      d.setDate(d.getDate() + i * 7)

      deliveries.push({
        subscription_id: subscription.id,
        user_id: order.user_id,
        delivery_date: d.toISOString().split("T")[0],
        status: "pending"
      })
    }

    await supabase
      .from("deliveries")
      .insert(deliveries)

    return NextResponse.json({ ok: true })

  } catch (error) {

    console.error("WEBHOOK ERROR", error)

    return NextResponse.json(
      { error: "webhook error" },
      { status: 500 }
    )
  }
}
