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

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const email = normalizeEmail(body.email)
    const phone = normalizeArgentinaPhone(body.phone || body.customer_phone)

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Necesitamos email o WhatsApp para identificarte" },
        { status: 400 }
      )
    }

    let profile: any = null

    if (email) {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          full_name,
          email,
          phone,
          address,
          city,
          neighborhood,
          created_at
        `)
        .eq("email", email)
        .maybeSingle()

      if (error) {
        console.error("profile lookup by email error", error)
      }

      profile = data
    }

    if (!profile && phone) {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          full_name,
          email,
          phone,
          address,
          city,
          neighborhood,
          created_at
        `)
        .eq("phone", phone)
        .maybeSingle()

      if (error) {
        console.error("profile lookup by phone error", error)
      }

      profile = data
    }

    if (!profile) {
      return NextResponse.json({
        ok: true,
        exists: false,
        user: null
      })
    }

    return NextResponse.json({
      ok: true,
      exists: true,
      user: {
        id: profile.id,
        name: profile.full_name || profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        neighborhood: profile.neighborhood || ""
      }
    })
  } catch (error: any) {
    console.error("app me route error", error)

    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
