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

  try {

    const { title, price, user_id, box_type } = await req.json()

    console.log("CHECKOUT DATA", {
      title,
      price,
      user_id,
      box_type
    })

    const preference = new Preference(mp)

    const result = await preference.create({
      body: {

        items: [
          {
            id: String(title),
            title: String(title),
            quantity: 1,
            currency_id: "ARS",
            unit_price: Number(price)
          }
        ],

        external_reference: String(user_id),

        metadata: {
          user_id: String(user_id),
          box_type: String(box_type)
        },

        notification_url:
          "https://quintasygranjas.com/api/webhook/mercadopago",

        back_urls: {
          success: "https://quintasygranjas.com/success",
          failure: "https://quintasygranjas.com/error",
          pending: "https://quintasygranjas.com/pending"
        },

        auto_return: "approved"
      }
    })

    console.log("MP PREFERENCE CREATED", result.id)


const { error } = await supabase
  .from("orders")
  .insert({
    user_id: user_id,
    box_id: box_type,
    price: Number(price),
    mp_preference_id: result.id,
    status: "pending"
  })
    if (error) {
      console.error("SUPABASE ORDER ERROR", error)
    }

    return NextResponse.json({
      url: result.init_point
    })

  } catch (error) {

    console.error("CHECKOUT ERROR", error)

    return NextResponse.json(
      { error: "checkout error" },
      { status: 500 }
    )
  }
}
