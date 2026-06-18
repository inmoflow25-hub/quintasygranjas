import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

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

  if (phone.startsWith("549")) {
    return `+${phone}`
  }

  if (phone.startsWith("54") && !phone.startsWith("549")) {
    return `+549${phone.slice(2)}`
  }

  if (phone.startsWith("11")) {
    return `+549${phone}`
  }

  return `+54${phone}`
}

function cleanText(value: unknown) {
  return String(value || "").trim()
}

function buildAddressKey(addressRow: any) {
  if (addressRow.user_id) return String(addressRow.user_id)

  const phone = normalizeArgentinaPhone(addressRow.phone)

  if (phone) return phone

  return String(addressRow.id)
}

function buildLocationKeys(location: any) {
  const keys = new Set<string>()

  const customerKey = cleanText(location.customer_key)
  const phone = normalizeArgentinaPhone(location.customer_phone)
  const email = normalizeEmail(location.customer_email)

  if (customerKey) keys.add(customerKey)
  if (phone) keys.add(phone)
  if (email) keys.add(email)

  return Array.from(keys)
}

export async function POST() {
  try {
    await requireAdmin()

    const { data: addresses, error: addressesError } = await supabase
      .from("addresses")
      .select(`
        id,
        user_id,
        address,
        city,
        notes,
        phone,
        created_at
      `)
      .not("address", "is", null)
      .order("created_at", { ascending: false })

    if (addressesError) {
      console.error("sync addresses error", addressesError)

      return NextResponse.json(
        { error: "No se pudieron leer los domicilios" },
        { status: 500 }
      )
    }

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        name
      `)

    if (usersError) {
      console.error("sync users error", usersError)

      return NextResponse.json(
        { error: "No se pudieron leer los usuarios" },
        { status: 500 }
      )
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        full_name,
        email,
        phone
      `)

    if (profilesError) {
      console.error("sync profiles error", profilesError)

      return NextResponse.json(
        { error: "No se pudieron leer los perfiles" },
        { status: 500 }
      )
    }

    const { data: existingLocations, error: existingError } = await supabase
      .from("customer_locations")
      .select(`
        id,
        customer_key,
        customer_email,
        customer_phone,
        lat,
        lng,
        geocoding_status,
        notes
      `)

    if (existingError) {
      console.error("load existing customer_locations error", existingError)

      return NextResponse.json(
        { error: "No se pudieron leer los clientes actuales del mapa" },
        { status: 500 }
      )
    }

    const usersById = new Map<string, any>()
    const profilesById = new Map<string, any>()
    const existingByKey = new Map<string, any>()

    for (const user of users || []) {
      if (user.id) usersById.set(String(user.id), user)
    }

    for (const profile of profiles || []) {
      if (profile.id) profilesById.set(String(profile.id), profile)
    }

    for (const location of existingLocations || []) {
      for (const key of buildLocationKeys(location)) {
        if (!key) continue

        const current = existingByKey.get(key)
        const currentHasCoords = current?.lat !== null && current?.lng !== null
        const nextHasCoords = location?.lat !== null && location?.lng !== null

        if (!current || (!currentHasCoords && nextHasCoords)) {
          existingByKey.set(key, location)
        }
      }
    }

    const rows = (addresses || [])
      .map((addressRow: any) => {
        const customerKey = buildAddressKey(addressRow)
        const user = addressRow.user_id
          ? usersById.get(String(addressRow.user_id))
          : null
        const profile = addressRow.user_id
          ? profilesById.get(String(addressRow.user_id))
          : null

        const customerName =
          cleanText(profile?.full_name) ||
          cleanText(profile?.name) ||
          cleanText(user?.name) ||
          cleanText(addressRow.notes) ||
          normalizeArgentinaPhone(addressRow.phone) ||
          "Cliente"

        const customerEmail =
          normalizeEmail(profile?.email) ||
          normalizeEmail(user?.email) ||
          null

        const customerPhone =
          normalizeArgentinaPhone(addressRow.phone) ||
          normalizeArgentinaPhone(profile?.phone) ||
          null

        const existing =
          existingByKey.get(customerKey) ||
          existingByKey.get(customerPhone || "") ||
          existingByKey.get(customerEmail || "")

        return {
          existing_id: existing?.id || null,
          customer_key: customerKey,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          address: cleanText(addressRow.address),
          city: cleanText(addressRow.city) || "Buenos Aires",
          lat: existing?.lat ?? null,
          lng: existing?.lng ?? null,
          geocoding_status:
            existing?.lat !== null && existing?.lng !== null
              ? existing?.geocoding_status || "ok"
              : "pending",
          notes:
            existing?.lat !== null && existing?.lng !== null
              ? existing?.notes || `Domicilio sincronizado desde addresses: ${addressRow.id}`
              : `Domicilio pendiente desde addresses: ${addressRow.id}`,
          updated_at: new Date().toISOString()
        }
      })
      .filter((row: any) => row.customer_key && row.address)

    let inserted = 0
    let updated = 0
    let failed = 0
    const errors: string[] = []

    for (const row of rows) {
      if (row.existing_id) {
        const updatePayload: any = {
          customer_key: row.customer_key,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          address: row.address,
          city: row.city,
          updated_at: row.updated_at
        }

        if (row.lat === null || row.lng === null) {
          updatePayload.lat = null
          updatePayload.lng = null
          updatePayload.geocoding_status = "pending"
          updatePayload.notes = row.notes
        }

        const { error: updateError } = await supabase
          .from("customer_locations")
          .update(updatePayload)
          .eq("id", row.existing_id)

        if (updateError) {
          failed += 1
          errors.push(`${row.customer_key}: ${updateError.message}`)
          continue
        }

        updated += 1
      } else {
        const insertPayload = {
          customer_key: row.customer_key,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          address: row.address,
          city: row.city,
          lat: row.lat,
          lng: row.lng,
          geocoding_status: row.geocoding_status,
          notes: row.notes,
          updated_at: row.updated_at
        }

        const { error: insertError } = await supabase
          .from("customer_locations")
          .insert(insertPayload)

        if (insertError) {
          failed += 1
          errors.push(`${row.customer_key}: ${insertError.message}`)
          continue
        }

        inserted += 1
      }
    }

    return NextResponse.json({
      ok: true,
      source: "addresses",
      addresses_read: addresses?.length || 0,
      domicilios: rows.length,
      inserted,
      updated,
      synced: inserted + updated,
      failed,
      errors: errors.slice(0, 10),

      read_orders: addresses?.length || 0,
      usable_orders: rows.length,
      unique_customers: rows.length
    })
  } catch (error: any) {
    console.error("sync customer locations from addresses error", error)

    return NextResponse.json(
      { error: error?.message || "Error sincronizando domicilios al mapa" },
      { status: 500 }
    )
  }
}
