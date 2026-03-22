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

    const boxId =
      paymentInfo.metadata?.box_id ||
      paymentInfo.additional_info?.items?.[0]?.id ||
      null

    if (!userId || !boxId) {
      return NextResponse.json({ ok: true })
    }

    const { data: alreadyPaidOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("mp_payment_id", String(paymentId))
      .maybeSingle()

    if (alreadyPaidOrder) {
      return NextResponse.json({ success: true })
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
      return NextResponse.json({ ok: true })
    }

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        mp_payment_id: String(paymentId)
      })
      .eq("id", order.id)

    if (orderUpdateError) {
      console.error(orderUpdateError)
      return NextResponse.json({ ok: true })
    }

    // 🔥 CREAR ENTREGA (UNA SOLA)
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 2) // ajustá si querés

    await supabase.from("deliveries").insert({
      user_id: userId,
      order_id: order.id,
      delivery_date: deliveryDate.toISOString().split("T")[0],
      status: "pending"
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("WEBHOOK ERROR", error)

    return NextResponse.json({ ok: true })
  }
}
