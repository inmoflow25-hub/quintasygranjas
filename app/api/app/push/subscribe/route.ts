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
      console.error("push subscribe profile email lookup error", error)
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
      console.error("push subscribe profile phone lookup error", error)
    }

    if (data?.id) return data.id
  }

  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const email = normalizeEmail(body.email)
    const phone = normalizeArgentinaPhone(body.phone)
    const subscription = body.subscription

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { error: "Falta la suscripción push" },
        { status: 400 }
      )
    }

    const userId = await findUserId({ email, phone })

    if (!userId) {
      return NextResponse.json(
        { error: "No se pudo identificar al cliente" },
        { status: 404 }
      )
    }

    const p256dh = subscription?.keys?.p256dh || ""
    const auth = subscription?.keys?.auth || ""

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: "Suscripción push incompleta" },
        { status: 400 }
      )
    }

    const userAgent = req.headers.get("user-agent") || ""

  const now = new Date().toISOString()

const { data, error } = await supabase
  .from("push_subscriptions")
  .upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh,
      auth,
      user_agent: userAgent,
      app_context: "pwa",
      permission_status: "granted",
      active: true,
      last_seen_at: now
    },
    {
      onConflict: "endpoint"
    }
  )
  .select("id")
  .single()
    
if (error) {
  console.error("push subscribe upsert error", error)

  return NextResponse.json(
    {
      error: "No se pudo guardar la suscripción",
      detail: error.message,
      code: error.code,
      hint: error.hint
    },
    { status: 500 }
  )
}

    return NextResponse.json({
      ok: true,
      subscription_id: data.id
    })
  } catch (error: any) {
    console.error("push subscribe route error", error)

    return NextResponse.json(
      { error: error?.message || "Error interno" },
      { status: 500 }
    )
  }
}
