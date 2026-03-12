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

export async function POST(req: Request) {

  const { title, price, user_id } = await req.json()

  const preference = new Preference(mp)

 const result = await preference.create({
  body: {
    items: [
      {
        id: title,
        title,
        quantity: 1,
        currency_id: "ARS",
        unit_price: price
      }
    ],

    external_reference: user_id,

    metadata: {
      user_id,
      box_type
    },

    notification_url: "https://quintasygranjas.com/api/webhook/mercadopago",

    back_urls: {
      success: "https://quintasygranjas.com/success",
      failure: "https://quintasygranjas.com/error",
      pending: "https://quintasygranjas.com/pending"
    },

    auto_return: "approved"
  }
})

  await supabase
    .from("orders")
    .insert({
      user_id,
      box: title,
      price,
      mp_preference: result.id,
      status: "pending"
    })

  return NextResponse.json({
    url: result.init_point
  })
}
