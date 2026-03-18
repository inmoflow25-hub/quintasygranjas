import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago"
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

    const paymentId = body.data?.id || body.id

    if (!paymentId) {
      console.error("NO PAYMENT ID", body)
      return NextResponse.json({ ok: true })
    }

    const payment = new Payment(mp)
    const paymentInfo: any = await payment.get({ id: paymentId })

    if (!paymentInfo || paymentInfo.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const userId = String(paymentInfo.external_reference || "")
    const boxId = String(paymentInfo.metadata?.box_id || "")

    if (!userId || !boxId) {
      return NextResponse.json({ error: "missing data" }, { status: 400 })
    }

    const { data: alreadyPaidOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("mp_payment_id", String(paymentId))
      .maybeSingle()

    if (alreadyPaidOrder) {
      return NextResponse.json({ success: true, duplicated: true })
    }

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .eq("box_id", boxId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 })
    }

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        mp_payment_id: String(paymentId)
      })
      .eq("id", order.id)

    if (orderUpdateError) {
      console.error("ORDER UPDATE ERROR", orderUpdateError)
      return NextResponse.json({ error: "order update failed" }, { status: 500 })
    }

    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("box_id", boxId)
      .eq("active", true)
      .maybeSingle()

    if (existingSubscription) {
      return NextResponse.json({ success: true, subscription_exists: true })
    }

    const { data: box } = await supabase
      .from("boxes")
      .select("*")
      .eq("id", boxId)
      .single()

    if (!box) {
      return NextResponse.json({ error: "box not found" }, { status: 500 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    const { data: address } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 7)

    const payerEmail =
      paymentInfo?.payer?.email ||
      paymentInfo?.additional_info?.payer?.email ||
      null

    if (!payerEmail) {
      console.error("MISSING PAYER EMAIL", paymentInfo)
      return NextResponse.json({ error: "missing payer email" }, { status: 500 })
    }

    const price = Number(box.price_subscription)

    if (!price || Number.isNaN(price)) {
      console.error("INVALID PRICE", box)
      return NextResponse.json({ error: "invalid price" }, { status: 500 })
    }

    const preapproval = new PreApproval(mp)

    const subResult = await preapproval.create({
      body: {
        reason: `Suscripción ${box.name}`,
        external_reference: String(userId),
        payer_email: payerEmail,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: price,
          currency_id: "ARS",
          start_date: startDate.toISOString()
        },
        back_url: "https://quintasygranjas.com/success",
        status: "authorized"
      }
    })

    if (!subResult?.id) {
      console.error("PREAPPROVAL ERROR", subResult)
      return NextResponse.json({ error: "failed to create subscription" }, { status: 500 })
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        box_id: box.id,
        box: box.name,
        plan: box.name,
        active: true,
        address_id: address?.id ?? null,
        start_date: startDate.toISOString(),
        next_charge: startDate.toISOString(),
        mp_subscription_id: subResult.id
      })
      .select()
      .single()

    if (subscriptionError || !subscription) {
      console.error("SUBSCRIPTION INSERT FAILED", subscriptionError)
      return NextResponse.json({ error: "subscription error" }, { status: 500 })
    }

    const deliveries = []

    for (let i = 0; i < 4; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i * 7)

      deliveries.push({
        subscription_id: subscription.id,
        user_id: userId,
        delivery_date: d.toISOString().split("T")[0],
        status: "pending"
      })
    }

    const { error: deliveryError } = await supabase
      .from("deliveries")
      .insert(deliveries)

    if (deliveryError) {
      console.error("DELIVERY INSERT ERROR", deliveryError)
      return NextResponse.json({ error: "delivery error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("WEBHOOK ERROR", error)

    return NextResponse.json(
      { error: "webhook error" },
      { status: 500 }
    )
  }
}
