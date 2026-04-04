import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { box } = await req.json()

  const prices: any = {
    veggie: 27800,
    campo: 47400,
    granja: 56800
  }

  const titles: any = {
    veggie: "Caja Veggie",
    campo: "Caja Campo",
    granja: "Caja Granja"
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [
        {
          title: titles[box],
          quantity: 1,
          currency_id: "ARS",
          unit_price: prices[box]
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pending`
      },
      auto_return: "approved"
    })
  })

  const data = await response.json()

  return NextResponse.json({
    init_point: data.init_point
  })
}
