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

function cleanText(value: unknown) {
  return String(value || "").trim()
}

function buildCustomerKey(order: any) {
  const phone = normalizeArgentinaPhone(order.customer_phone)
  const email = normalizeEmail(order.customer_email)

  if (phone) return phone
  if (email) return email
  if (order.user_id) return String(order.user_id)

  return String(order.id)
}

function buildCoordinateKey(row: any) {
  const phone = normalizeArgentinaPhone(row.customer_phone)
  const email = normalizeEmail(row.customer_email)

  if (phone) return phone
  if (email) return email

  return String(row.customer_key || "")
}

export async function POST() {
  try {
    await requireAdmin()

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

    const existingByKey = new Map<string, any>()

    for (const location of existingLocations || []) {
      const key = buildCoordinateKey(location)

      if (!key) continue

      existingByKey.set(key, location)
    }

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        created_at,
        source,
        status,
        payment_method,
        payment_status,
        is_test,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        delivery_city,
        delivery_notes
      `)
      .not("delivery_address", "is", null)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("sync customer locations orders error", ordersError)

      return NextResponse.json(
        { error: "No se pudieron leer los pedidos" },
        { status: 500 }
      )
    }

    const usableOrders = (orders || []).filter((order: any) => {
      if (order.is_test === true) return false

      const address = cleanText(order.delivery_address)
      const phone = normalizeArgentinaPhone(order.customer_phone)
      const email = normalizeEmail(order.customer_email)

      if (!address) return false
      if (!phone && !email && !order.user_id) return false

      return true
    })

    const grouped = new Map<string, any>()

    for (const order of usableOrders) {
      const customerKey = buildCustomerKey(order)

      if (!customerKey) continue
      if (grouped.has(customerKey)) continue

      const customerName = cleanText(order.customer_name)
      const customerEmail = normalizeEmail(order.customer_email)
      const customerPhone = normalizeArgentinaPhone(order.customer_phone)
      const address = cleanText(order.delivery_address)
      const city = cleanText(order.delivery_city)

      if (!address) continue

      const existing =
        existingByKey.get(customerPhone) ||
        existingByKey.get(customerEmail) ||
        existingByKey.get(customerKey)

      grouped.set(customerKey, {
        existing_id: existing?.id || null,
        customer_key: customerKey,
        customer_name: customerName || customerPhone || customerEmail || "Cliente",
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        address,
        city: city || "Buenos Aires",
        lat: existing?.lat ?? null,
        lng: existing?.lng ?? null,
        geocoding_status:
          existing?.lat !== null && existing?.lng !== null
            ? existing?.geocoding_status || "ok"
            : "pending",
        notes:
          existing?.lat !== null && existing?.lng !== null
            ? existing?.notes || `Actualizado desde pedido: ${order.id}`
            : `Sincronizado desde pedido: ${order.id}`,
        updated_at: new Date().toISOString()
      })
    }

    const rows = Array.from(grouped.values())

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
      read_orders: orders?.length || 0,
      usable_orders: usableOrders.length,
      unique_customers: rows.length,
      inserted,
      updated,
      synced: inserted + updated,
      failed,
      errors: errors.slice(0, 10)
    })
  } catch (error: any) {
    console.error("sync customer locations error", error)

    return NextResponse.json(
      { error: error?.message || "Error sincronizando clientes reales al mapa" },
      { status: 500 }
    )
  }
}
