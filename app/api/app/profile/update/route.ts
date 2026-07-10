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
  userId,
  email,
  phone
}: {
  userId: string
  email: string
  phone: string
}) {
  if (userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("profile update user_id lookup error", error)
    }

    if (data?.id) return data.id
  }

  if (email) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (error) {
      console.error("profile update email lookup error", error)
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
      console.error("profile update phone lookup error", error)
    }

    if (data?.id) return data.id
  }

  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const userIdFromBody = String(body.user_id || body.id || "").trim()
    const name = String(body.name || body.full_name || "").trim()
    const email = normalizeEmail(body.email)
    const phone = normalizeArgentinaPhone(body.phone || body.customer_phone)
    const address = String(body.address || body.delivery_address || "").trim()
    const city = String(body.city || body.delivery_city || "").trim()
    const neighborhood = String(body.neighborhood || "").trim()

    if (!email && !phone && !userIdFromBody) {
      return NextResponse.json(
        { error: "Necesitamos usuario, email o WhatsApp para actualizar el perfil" },
        { status: 400 }
      )
    }

    const userId = await findUserId({
      userId: userIdFromBody,
      email,
      phone
    })

    if (!userId) {
      return NextResponse.json(
        { error: "No encontramos el usuario para actualizar" },
        { status: 404 }
      )
    }

    const profilePayload: any = {
      id: userId,
      updated_at: new Date().toISOString()
    }

    if (name) {
      profilePayload.name = name
      profilePayload.full_name = name
    }

    if (email) {
      profilePayload.email = email
    }

    if (phone) {
      profilePayload.phone = phone
    }

    if (address) {
      profilePayload.address = address
    }

    if (city) {
      profilePayload.city = city
    }

    if (neighborhood) {
      profilePayload.neighborhood = neighborhood
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload)
      .select(`
        id,
        name,
        full_name,
        email,
        phone,
        address,
        city,
        neighborhood
      `)
      .single()

    if (profileError) {
      console.error("profile update error", profileError)

      return NextResponse.json(
        { error: "No se pudo actualizar el perfil" },
        { status: 500 }
      )
    }

    if (address || city || phone || neighborhood) {
      const addressPayload: any = {
        user_id: userId,
        updated_at: new Date().toISOString()
      }

      if (address) addressPayload.address = address
      if (city) addressPayload.city = city
      if (phone) addressPayload.phone = phone
      if (neighborhood) addressPayload.neighborhood = neighborhood

      const { error: addressError } = await supabase
        .from("addresses")
        .upsert(addressPayload, { onConflict: "user_id" })

      if (addressError) {
        console.error("address update error", addressError)
      }
    }

    return NextResponse.json({
      ok: true,
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
    console.error("profile update route error", error)

    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
