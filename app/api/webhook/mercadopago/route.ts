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

    // 🔥 EMAIL Y NOMBRE DEL CLIENTE
    const email =
      paymentInfo.payer?.email ||
      paymentInfo.additional_info?.payer?.email ||
      null

    const name =
      paymentInfo.payer?.first_name ||
      paymentInfo.additional_info?.payer?.first_name ||
      "Cliente"

    const lastName =
      paymentInfo.payer?.last_name ||
      paymentInfo.additional_info?.payer?.last_name ||
      ""

    const fullName = `${name} ${lastName}`.trim()

    const boxId =
      paymentInfo.metadata?.box_id ||
      paymentInfo.additional_info?.items?.[0]?.id ||
      null

    const price = Number(paymentInfo.transaction_amount || 0)

    if (!email || !boxId) {
      console.error("MISSING DATA", paymentInfo)
      return NextResponse.json({ ok: true })
    }

    // 🔒 evitar duplicados
    const { data: existing } = await supabase
      .from("orders")
      .select("*")
      .eq("mp_payment_id", String(paymentId))
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true })
    }

    // 👤 UPSERT USER
    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (!user) {
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          email: email
        })
        .select()
        .single()

      user = newUser
    }

    // 👤 PROFILE (NOMBRE)
    await supabase.from("profiles").upsert({
      id: user.id,
      name: fullName
    })

    // 📦 ORDER
    const { data: order } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        box_id: boxId,
        price: price,
        status: "paid",
        mp_payment_id: String(paymentId)
      })
      .select()
      .single()

    // 🚚 DELIVERY
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 2)

    await supabase.from("deliveries").insert({
      user_id: user.id,
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

