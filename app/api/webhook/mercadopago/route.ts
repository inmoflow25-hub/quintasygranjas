import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  const body = await req.json()

  if (body.type !== "payment") {
    return NextResponse.json({ ok: true })
  }

  const paymentId = body.data.id

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    }
  )

  const payment = await res.json()

  if (payment.status === "approved") {

    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("mp_preference", payment.order.id)

  }

  return NextResponse.json({ ok: true })
}
