import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeEmail(email: string | null | undefined) {
  return String(email || "").trim().toLowerCase()
}

function normalizeArgentinaPhone(rawPhone: string | null | undefined) {
  let phone = String(rawPhone || "").replace(/\D/g, "")

  if (!phone) return ""

  if (phone.startsWith("00")) {
    phone = phone.slice(2)
  }

  if (phone.startsWith("011")) {
    phone = `11${phone.slice(3)}`
  }

  if (phone.startsWith("15") && phone.length >= 10) {
    phone = `11${phone.slice(2)}`
  }

  if (phone.startsWith("5411")) {
    phone = `54911${phone.slice(4)}`
  }

  if (phone.startsWith("54911")) {
    return `+${phone}`
  }

  if (phone.startsWith("11")) {
    return `+549${phone}`
  }

  if (phone.startsWith("54") && !phone.startsWith("549")) {
    return `+549${phone.slice(2)}`
  }

  return `+54${phone}`
}

async function findUserId({
  email,
  phone
}: {
  email: string
  phone: string
}) {
  if (email) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (error) {
      console.error("points profile email lookup error", error)
    }

    if (data?.id) return data.id
  }

  if (phone) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle()

    if (error) {
      console.error("points profile phone lookup error", error)
    }

    if (data?.id) return data.id
  }

  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const email = normalizeEmail(body.email)
    const phone = normalizeArgentinaPhone(body.phone || body.customer_phone)

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Necesitamos email o WhatsApp para consultar tus puntos" },
        { status: 400 }
      )
    }

    const userId = await findUserId({ email, phone })

    if (!userId) {
      return NextResponse.json({
        ok: true,
        exists: false,
        points: {
          points_balance: 0,
          available_points: 0,
          lifetime_points: 0,
          current_level: "nivel_1_semilla",
          current_level_name: "Nivel 1 — Semilla",
          available_discount_value: 0,
          next_expiration_at: null,
          point_value_ars: 2,
          max_redemption_percent: 10,
          minimum_order_amount_for_redemption: 20000
        }
      })
    }

    const { data: summary, error: summaryError } = await supabase
      .from("user_points_app_summary")
      .select(`
        user_id,
        points_balance,
        available_points,
        lifetime_points,
        current_level,
        current_level_name,
        available_discount_value,
        next_expiration_at,
        point_value_ars,
        max_redemption_percent,
        minimum_order_amount_for_redemption
      `)
      .eq("user_id", userId)
      .maybeSingle()

    if (summaryError) {
      console.error("points summary lookup error", summaryError)

      return NextResponse.json(
        { error: "No se pudieron consultar los puntos" },
        { status: 500 }
      )
    }

    if (!summary) {
      return NextResponse.json({
        ok: true,
        exists: true,
        user_id: userId,
        points: {
          points_balance: 0,
          available_points: 0,
          lifetime_points: 0,
          current_level: "nivel_1_semilla",
          current_level_name: "Nivel 1 — Semilla",
          available_discount_value: 0,
          next_expiration_at: null,
          point_value_ars: 2,
          max_redemption_percent: 10,
          minimum_order_amount_for_redemption: 20000
        }
      })
    }

    return NextResponse.json({
      ok: true,
      exists: true,
      user_id: userId,
      points: {
        points_balance: Number(summary.points_balance || 0),
        available_points: Number(summary.available_points || 0),
        lifetime_points: Number(summary.lifetime_points || 0),
        current_level: summary.current_level || "nivel_1_semilla",
        current_level_name: summary.current_level_name || "Nivel 1 — Semilla",
        available_discount_value: Number(summary.available_discount_value || 0),
        next_expiration_at: summary.next_expiration_at || null,
        point_value_ars: Number(summary.point_value_ars || 2),
        max_redemption_percent: Number(summary.max_redemption_percent || 10),
        minimum_order_amount_for_redemption: Number(
          summary.minimum_order_amount_for_redemption || 20000
        )
      }
    })
  } catch (error: any) {
    console.error("app points route error", error)

    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
