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
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (data?.id) return data.id
  }

  if (email) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (data?.id) return data.id
  }

  if (phone) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle()

    if (data?.id) return data.id
  }

  if (email) {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

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
        { error: "Necesitamos email o WhatsApp para guardar tu perfil." },
        { status: 400 }
      )
    }

    let userId = await findUserId({
      userId: userIdFromBody,
      email,
      phone
    })

    if (!userId) {
      userId = crypto.randomUUID()

      const { error: createUserError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: email || null,
          name: name || ""
        })

      if (createUserError) {
        console.error("profile create user error", createUserError)

        return NextResponse.json(
          {
            error:
              createUserError.message ||
              "No se pudo crear el usuario para guardar el perfil."
          },
          { status: 500 }
        )
      }
    } else {
      const userUpdatePayload: any = {}

      if (email) userUpdatePayload.email = email
      if (name) userUpdatePayload.name = name

      if (Object.keys(userUpdatePayload).length > 0) {
        await supabase
          .from("users")
          .update(userUpdatePayload)
          .eq("id", userId)
      }
    }

    const profilePayload: any = {
      id: userId,
      name,
      full_name: name,
      email,
      phone,
      address,
      city,
      neighborhood
    }

    Object.keys(profilePayload).forEach((key) => {
      if (profilePayload[key] === "") {
        delete profilePayload[key]
      }
    })

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    let profileResult

    if (existingProfile?.id) {
      profileResult = await supabase
        .from("profiles")
        .update(profilePayload)
        .eq("id", userId)
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
    } else {
      profileResult = await supabase
        .from("profiles")
        .insert(profilePayload)
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
    }

    if (profileResult.error || !profileResult.data) {
      console.error("profile save error", profileResult.error)

      return NextResponse.json(
        {
          error:
            profileResult.error?.message ||
            "No se pudo guardar el perfil."
        },
        { status: 500 }
      )
    }

    if (address || city || phone || neighborhood) {
      const addressPayload: any = {
        user_id: userId,
        address,
        city,
        phone,
        neighborhood
      }

      Object.keys(addressPayload).forEach((key) => {
        if (addressPayload[key] === "") {
          delete addressPayload[key]
        }
      })

      const { error: addressError } = await supabase
        .from("addresses")
        .upsert(addressPayload, { onConflict: "user_id" })

      if (addressError) {
        console.error("address update error", addressError)
      }
    }

    const profile = profileResult.data

    return NextResponse.json({
      ok: true,
      user: {
        id: profile.id,
        name: profile.full_name || profile.name || "",
        email: profile.email || email || "",
        phone: profile.phone || phone || "",
        address: profile.address || address || "",
        city: profile.city || city || "",
        neighborhood: profile.neighborhood || neighborhood || ""
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
