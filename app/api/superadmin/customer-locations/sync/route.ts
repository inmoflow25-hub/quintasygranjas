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
  return String(value || "").replace(/\s+/g, " ").trim()
}

function normalizeComparableText(value: unknown) {
  return cleanText(value).toLowerCase()
}

function buildCustomerKey(order: any) {
  const phone = normalizeArgentinaPhone(order.customer_phone)
  const email = normalizeEmail(order.customer_email)

  return phone || email || String(order.user_id || order.id)
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

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        delivery_city,
        delivery_notes,
        created_at,
        is_test
      `)
      .eq("is_test", false)
      .not("delivery_address", "is", null)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("sync orders error", ordersError)

      return NextResponse.json(
        { error: "No se pudieron leer las órdenes" },
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
        address,
        city,
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

    const existingByKey = new Map<string, any>()

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

    const latestByCustomer = new Map<string, any>()

    for (const order of orders || []) {
      const customerKey = buildCustomerKey(order)

      if (!customerKey) continue
      if (latestByCustomer.has(customerKey)) continue

      const phone = normalizeArgentinaPhone(order.customer_phone)
      const email = normalizeEmail(order.customer_email)
      const address = cleanText(order.delivery_address)

      if (!address) continue

      latestByCustomer.set(customerKey, {
        customer_key: customerKey,
        customer_name: cleanText(order.customer_name) || phone || email || "Cliente",
        customer_email: email || null,
        customer_phone: phone || null,
        address,
        city: cleanText(order.delivery_city) || "Buenos Aires",
        notes: cleanText(order.delivery_notes),
        source_order_id: order.id,
        source_order_created_at: order.created_at,
        updated_at: new Date().toISOString()
      })
    }

    const rows = Array.from(latestByCustomer.values())

    let inserted = 0
    let updated = 0
    let addressChanged = 0
    let failed = 0
    const errors: string[] = []

    for (const row of rows) {
      const existing =
        existingByKey.get(row.customer_key) ||
        existingByKey.get(row.customer_phone || "") ||
        existingByKey.get(row.customer_email || "")

      if (existing?.id) {
        const existingAddress = normalizeComparableText(existing.address)
        const existingCity = normalizeComparableText(existing.city)
        const nextAddress = normalizeComparableText(row.address)
        const nextCity = normalizeComparableText(row.city)

        const changedAddress =
          existingAddress !== nextAddress || existingCity !== nextCity

        const updatePayload: any = {
          customer_key: row.customer_key,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          address: row.address,
          city: row.city,
          notes: row.notes || existing.notes,
          updated_at: row.updated_at
        }

        if (changedAddress) {
          updatePayload.lat = null
          updatePayload.lng = null
          updatePayload.geocoding_status = "pending"
          updatePayload.notes = row.notes
            ? `Domicilio actualizado desde order ${row.source_order_id}. ${row.notes}`
            : `Domicilio actualizado desde order ${row.source_order_id}`

          addressChanged += 1
        }

        const { error: updateError } = await supabase
          .from("customer_locations")
          .update(updatePayload)
          .eq("id", existing.id)

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
          lat: null,
          lng: null,
          geocoding_status: "pending",
          notes: row.notes
            ? `Domicilio creado desde order ${row.source_order_id}. ${row.notes}`
            : `Domicilio creado desde order ${row.source_order_id}`,
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
      source: "orders",
      orders_read: orders?.length || 0,
      unique_customers: rows.length,
      inserted,
      updated,
      address_changed: addressChanged,
      synced: inserted + updated,
      failed,
      errors: errors.slice(0, 10),

      read_orders: orders?.length || 0,
      usable_orders: orders?.length || 0,
      domicilios: rows.length,
      addresses_read: orders?.length || 0
    })
  } catch (error: any) {
    console.error("sync customer locations from orders error", error)

    return NextResponse.json(
      { error: error?.message || "Error sincronizando órdenes al mapa" },
      { status: 500 }
    )
  }
}
