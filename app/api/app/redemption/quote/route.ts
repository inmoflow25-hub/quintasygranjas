import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeMoney(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0
  }

  return Math.round(numberValue)
}

function normalizePoints(value: unknown) {
  const numberValue = Number(value || 0)

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0
  }

  return Math.floor(numberValue)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const subtotal = normalizeMoney(body.subtotal)
    const pointsToSpend = normalizePoints(body.points_to_spend)

    if (subtotal < 20000) {
      return NextResponse.json(
        { error: "El pedido mínimo para usar puntos es de $20.000" },
        { status: 400 }
      )
    }

    if (pointsToSpend <= 0) {
      return NextResponse.json({
        ok: true,
        subtotal,
        points_requested: 0,
        raw_discount: 0,
        max_allowed_discount: 0,
        applied_discount: 0,
        points_needed_for_applied_discount: 0,
        final_price_after_points: subtotal
      })
    }

    const { data, error } = await supabase.rpc(
      "calculate_points_redemption_discount",
      {
        p_points_to_spend: pointsToSpend,
        p_subtotal: subtotal
      }
    )

    if (error) {
      console.error("redemption quote error", error)

      return NextResponse.json(
        { error: "No se pudo calcular el descuento por puntos" },
        { status: 500 }
      )
    }

    const quote = Array.isArray(data) ? data[0] : data

    const appliedDiscount = Math.round(Number(quote?.applied_discount || 0))
    const finalPriceAfterPoints = Math.max(subtotal - appliedDiscount, 1)

    return NextResponse.json({
      ok: true,
      subtotal,
      points_requested: Number(quote?.points_requested || 0),
      raw_discount: Number(quote?.raw_discount || 0),
      max_allowed_discount: Number(quote?.max_allowed_discount || 0),
      applied_discount: appliedDiscount,
      points_needed_for_applied_discount: Number(
        quote?.points_needed_for_applied_discount || 0
      ),
      final_price_after_points: finalPriceAfterPoints
    })
  } catch (error: any) {
    console.error("redemption quote route error", error)

    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
