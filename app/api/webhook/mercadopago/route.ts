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

    // MercadoPago envía distintos eventos
    if (body.type !== "payment") {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data.id

    const payment = new Payment(mp)

    const paymentInfo = await payment.get({ id: paymentId })

    if (!paymentInfo) {
      return NextResponse.json({ error: "payment not found" })
    }

    const status = paymentInfo.status

    if (status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const userId = paymentInfo.external_reference

    const preferenceId = paymentInfo.order?.id

    // buscar order
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .single()

    if (!order) {
      return NextResponse.json({ error: "order not found" })
    }

    // marcar order como paid
    await supabase
      .from("orders")
      .update({
        status: "paid",
        mp_payment_id: paymentId
      })
      .eq("id", order.id)

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error("Webhook error:", error)

    return NextResponse.json(
      { error: "webhook error" },
      { status: 500 }
    )

  }
}
