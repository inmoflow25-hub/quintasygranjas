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

function normalizePhone(rawPhone: string | null | undefined) {
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
  const phone = normalizePhone(order.customer_phone)
  const email = normalizeEmail(order.customer_email)

  if (phone) return phone
  if (email) return email
  if (order.user_id) return String(order.user_id)

  return String(order.id)
}

function buildCoordinateKey(row: any) {
  const phone = normalizePhone(row.customer_phone)
  const email = normalizeEmail(row.customer_email)

  if (phone) return phone
  if (email) return email

  return String(row.customer_key || "")
}

function isRealConfirmedOrder(order: any) {
  if (order.is_test === true) return false
  if (order.status !== "confirmed") return false

  if (order.source === "csv_import_real") return false

  if (order.payment_method === "mercadopago") {
    return ["approved", "paid"].includes(String(order.payment_status || ""))
  }

  return true
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

    const coordinateMemory = new Map<string, any>()

    for (const location of existingLocations || []) {
      const key = buildCoordinateKey(location)

      if (!key) continue

      if (location.lat !== null && location.lng !== null) {
        coordinateMemory.set(key, {
          lat: location.lat,
          lng: location.lng,
          geocoding_status: location.geocoding_status || "ok",
          notes: location.notes || null
        })
      }
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
      .not("customer_phone", "is", null)
      .not("delivery_address", "is", null)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("sync customer locations orders error", ordersError)

      return NextResponse.json(
        { error: "No se pudieron leer los pedidos" },
        { status: 500 }
      )
    }

    const realOrders = (orders || []).filter(isRealConfirmedOrder)

    const grouped = new Map<string, any>()

    for (const order of realOrders) {
      const customerKey = buildCustomerKey(order)

      if (!customerKey) continue
      if (grouped.has(customerKey)) continue

      const customerName = cleanText(order.customer_name)
      const customerEmail = normalizeEmail(order.customer_email)
      const customerPhone = normalizePhone(order.customer_phone)
      const address = cleanText(order.delivery_address)
      const city = cleanText(order.delivery_city)

      if (!address) continue
      if (!customerName && !customerPhone && !customerEmail) continue

      const savedCoords = coordinateMemory.get(customerPhone) || coordinateMemory.get(customerEmail)

      grouped.set(customerKey, {
        customer_key: customerKey,
        customer_name: customerName || customerPhone || customerEmail || "Cliente",
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        address,
        city: city || "Buenos Aires",
        lat: savedCoords?.lat ?? null,
        lng: savedCoords?.lng ?? null,
        geocoding_status: savedCoords?.lat && savedCoords?.lng ? "ok" : "pending",
        notes: savedCoords?.notes || `Reconstruido desde pedido real. Último pedido: ${order.id}`,
        updated_at: new Date().toISOString()
      })
    }

    const rows = Array.from(grouped.values())

    const { error: deleteError } = await supabase
      .from("customer_locations")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")

    if (deleteError) {
      console.error("delete customer_locations error", deleteError)

      return NextResponse.json(
        { error: "No se pudo limpiar customer_locations" },
        { status: 500 }
      )
    }

    if (rows.length === 0) {
      return NextResponse.json({
        ok: true,
        read_orders: orders?.length || 0,
        real_orders: realOrders.length,
        unique_customers: 0,
        synced: 0,
        failed: 0,
        message: "No había clientes reales para cargar en el mapa"
      })
    }

    const { error: insertError } = await supabase
      .from("customer_locations")
      .insert(rows)

    if (insertError) {
      console.error("insert customer_locations error", insertError)

      return NextResponse.json(
        { error: "No se pudieron insertar clientes reales en el mapa" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      read_orders: orders?.length || 0,
      real_orders: realOrders.length,
      unique_customers: rows.length,
      synced: rows.length,
      failed: 0
    })
  } catch (error: any) {
    console.error("sync customer locations error", error)

    return NextResponse.json(
      { error: error?.message || "Error sincronizando clientes reales al mapa" },
      { status: 500 }
    )
  }
}
