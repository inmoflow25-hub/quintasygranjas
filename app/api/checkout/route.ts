import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
})

export async function POST(req: Request) {

  const { title, price } = await req.json()

  const preference = new Preference(client)

  const result = await preference.create({
    body: {
      items: [
        {
          id: title,
          title: title,
          quantity: 1,
          currency_id: "ARS",
          unit_price: price
        }
      ]
    }
  })

  return NextResponse.json({
    url: result.init_point
  })
}
