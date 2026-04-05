import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { box_id } = await req.json()

  const map: any = {
    "dff394c8-6a17-45e8-ba3f-960c27f8d76c": {
      title: "Caja Veggie",
      price: 27800
    },
    "d9c75e5b-3e8b-4d3d-9776-d65ad9afae1d": {
      title: "Caja Campo",
      price: 47400
    },
    "d5b70577-a2b7-47d7-9ccd-e2f336e25af7": {
      title: "Caja Granja",
      price: 56800
    }
  }

  const selected = map[box_id]

  if (!selected) {
    return NextResponse.json({ error: "box inválida" }, { status: 400 })
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
          title: selected.title,
          quantity: 1,
          currency_id: "ARS",
          unit_price: selected.price
        }
      ],

      // 🔥 ACA VA (CLAVE)
      external_reference: box_id,

      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pending`
      },

      auto_return: "approved"
    })
  })

  const data = await response.json()

  console.log("MP RESPONSE", data)

  return NextResponse.json({
    init_point: data.init_point
  })
}
