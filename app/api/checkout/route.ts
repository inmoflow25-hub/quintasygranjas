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
    const { box_id } = await req.json()

    if (!box_id) {
      return NextResponse.json(
        { error: "missing box id" },
        { status: 400 }
      )
    }

    const { data: box, error: boxError } = await supabase
      .from("boxes")
      .select("*")
      .eq("id", box_id)
      .maybeSingle()

    if (!box || boxError) {
      console.error("BOX LOOKUP ERROR", boxError)

      return NextResponse.json(
        { error: "box not found" },
        { status: 500 }
      )
    }

    const price = Number(box.price)

    if (!price || Number.isNaN(price)) {
      return NextResponse.json(
        { error: "invalid box price" },
        { status: 500 }
      )
    }

    const preference = new Preference(mp)

    const result = await preference.create({
      body: {
        items: [
          {
            id: String(box.id),
            title: String(box.name),
            quantity: 1,
            currency_id: "ARS",
            unit_price: price
          }
        ],

        // 🔥 SIN USER
        external_reference: String(box.id),

        metadata: {
          box_id: String(box.id),
          box_name: String(box.name)
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

    return NextResponse.json({
      preference_id: result.id
    })
  } catch (error) {
    console.error("CHECKOUT ERROR", error)

    return NextResponse.json(
      { error: "checkout error" },
      { status: 500 }
    )
  }
}

