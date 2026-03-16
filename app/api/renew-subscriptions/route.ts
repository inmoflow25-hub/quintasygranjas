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

  // buscar suscripciones activas que deben cobrarse
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("active", true)
    .lte("next_charge", today)

  if (!subs || subs.length === 0) {
    return NextResponse.json({ message: "no subscriptions to charge" })
  }

  for (const sub of subs) {

    // buscar la caja asociada a la suscripción
    const { data: box } = await supabase
      .from("boxes")
      .select("*")
      .eq("id", sub.box_id)
      .single()

    if (!box) {
      console.error("Box not found for subscription", sub.id)
      continue
    }

    const price = Number(box.price_subscription)

    const preference = new Preference(mp)

    const result = await preference.create({
      body: {

        items: [
          {
            id: String(box.id),
            title: `Suscripción ${box.name}`,
            quantity: 1,
            currency_id: "ARS",
            unit_price: price
          }
        ],

        external_reference: String(sub.user_id),

        notification_url:
          "https://quintasygranjas.com/api/webhook/mercadopago"
      }
    })

    // crear nueva orden
    await supabase
      .from("orders")
      .insert({
        user_id: sub.user_id,
        box_id: box.id,
        price: price,
        mp_preference_id: result.id,
        status: "pending"
      })

    // mover próxima fecha de cobro
    const nextCharge = new Date(sub.next_charge)
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
