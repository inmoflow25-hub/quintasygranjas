import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  const today = new Date().toISOString()

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("active", true)
    .lte("next_charge", today)

  if (!subs || subs.length === 0) {
    return NextResponse.json({ message: "no subscriptions to charge" })
  }

  for (const sub of subs) {

    const preference = new Preference(mp)

    const result = await preference.create({
      body: {

      items: [
  {
    id: "subscription-box",
    title: "Suscripción caja mensual",
    quantity: 1,
    currency_id: "ARS",
    unit_price: 12000
  }
],

        external_reference: String(sub.user_id),

        notification_url:
          "https://quintasygranjas.com/api/webhook/mercadopago"
      }
    })

    await supabase
      .from("orders")
      .insert({
        user_id: sub.user_id,
        price: 12000,
        mp_preference_id: result.id,
        status: "pending"
      })

    const nextCharge = new Date()
    nextCharge.setMonth(nextCharge.getMonth() + 1)

    await supabase
      .from("subscriptions")
      .update({
        next_charge: nextCharge.toISOString()
      })
      .eq("id", sub.id)
  }

  return NextResponse.json({ success: true })
}
