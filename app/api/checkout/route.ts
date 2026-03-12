import { NextResponse } from "next/server"
import mercadopago from "mercadopago"

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN!
})

export async function POST(req: Request) {

  const { title, price } = await req.json()

  const preference = {
    items: [
      {
        title,
        quantity: 1,
        currency_id: "ARS",
        unit_price: price
      }
    ],
    back_urls: {
      success: "https://quintasygranjas.com/gracias",
      failure: "https://quintasygranjas.com/error",
      pending: "https://quintasygranjas.com/pendiente"
    },
    auto_return: "approved"
  }

  const response = await mercadopago.preferences.create(preference)

  return NextResponse.json({
    url: response.body.init_point
  })
}
