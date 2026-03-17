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

    const paymentId =
      body.data?.id ||
      body.id

    if (!paymentId) {
      console.error("NO PAYMENT ID", body)
      return NextResponse.json({ ok: true })
    }

    const payment = new Payment(mp)
    const paymentInfo: any = await payment.get({ id: paymentId })

    if (!paymentInfo || paymentInfo.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const userId = paymentInfo.external_reference
    const boxId = paymentInfo.metadata?.box_id

    if (!userId || !boxId) {
      return NextResponse.json({ error: "missing data" }, { status: 400 })
    }

    // buscar orden
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 })
    }

    // marcar como paga
    await supabase
      .from("orders")
      .update({
        status: "paid",
        mp_payment_id: String(paymentId)
      })
      .eq("id", order.id)

    // 🔥 BUSCAR CAJA
    const { data: box } = await supabase
      .from("boxes")
      .select("*")
      .eq("id", boxId)
      .single()

    if (!box) {
      return NextResponse.json({ error: "box not found" }, { status: 500 })
    }

    // 🔥 FECHA INICIO = +7 días
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 7)

    // 🔥 EMAIL (SIN ROMPER TYPESCRIPT)
    const payerEmail =
      paymentInfo?.payer?.email ||
      paymentInfo?.additional_info?.payer?.first_name || // fallback dummy seguro
      `${userId}@noemail.com`

    // 🔥 PRECIO
    const price = Number(box.price_subscription)

    if (!price || Number.isNaN(price)) {
      console.error("INVALID PRICE", box)
      return NextResponse.json({ error: "invalid price" })
    }

    // 🔥 CREAR SUSCRIPCIÓN EN MP
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

    // 🔥 VALIDAR RESPUESTA MP
    if (!subResult?.id) {
      console.error("PREAPPROVAL ERROR", subResult)
      return NextResponse.json({ error: "failed to create subscription" })
    }

    // 🔥 GUARDAR SUBSCRIPTION EN TU DB
    const { data: subscription } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        box_id: box.id,
        active: true,
        start_date: startDate.toISOString(),
        next_charge: startDate.toISOString(),
        mp_subscription_id: subResult.id
      })
      .select()
      .single()

    if (!subscription) {
      console.error("SUBSCRIPTION INSERT FAILED")
      return NextResponse.json({ error: "subscription error" })
    }

    // 🔥 CREAR ENTREGAS (4 semanas)
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

    await supabase.from("deliveries").insert(deliveries)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("WEBHOOK ERROR", error)

    return NextResponse.json(
      { error: "webhook error" },
      { status: 500 }
    )
  }
}
