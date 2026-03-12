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
          id: "caja-semanal",
          title: title,
          quantity: 1,
          currency_id: "ARS",
          unit_price: Number(price)
        }
      ],
      back_urls: {
        success: "https://quintasygranjas.com/gracias",
        failure: "https://quintasygranjas.com/error",
        pending: "https://quintasygranjas.com/pendiente"
      },
      auto_return: "approved"
    }
  })

  return NextResponse.json({
    url: result.init_point
  })
}
