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

function normalizePhone(phone: string | null | undefined) {
  return String(phone || "").replace(/\D/g, "")
}

function buildCustomerKey(order: any) {
  const phone = normalizePhone(order.customer_phone)
  const email = normalizeEmail(order.customer_email)

  if (phone) return phone
  if (email) return email
  if (order.user_id) return String(order.user_id)

  return String(order.id)
}

function cleanText(value: unknown) {
  return String(value || "").trim()
}

export async function POST() {
  try {
    await requireAdmin()

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        created_at,
        status,
        payment_method,
        payment_status,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        delivery_city,
        delivery_notes
      `)
      .neq("is_test", true)
      .not("customer_phone", "is", null)
      .not("delivery_address", "is", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("sync customer locations orders error", error)

      return NextResponse.json(
        { error: "No se pudieron leer los pedidos" },
        { status: 500 }
      )
    }

    const grouped = new Map<string, any>()

    for (const order of orders || []) {
      const key = buildCustomerKey(order)

      if (!key) continue
      if (grouped.has(key)) continue

      const customerName = cleanText(order.customer_name)
      const customerEmail = normalizeEmail(order.customer_email)
      const customerPhone = cleanText(order.customer_phone)
      const address = cleanText(order.delivery_address)
      const city = cleanText(order.delivery_city)

      if (!customerName && !customerPhone && !customerEmail) continue
      if (!address) continue

      grouped.set(key, {
        customer_key: key,
        customer_name: customerName || customerPhone || customerEmail || "Cliente",
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        address,
        city: city || "Buenos Aires",
        geocoding_status: "pending",
        notes: `Sincronizado desde pedidos. Último pedido: ${order.id}`,
        updated_at: new Date().toISOString()
      })
    }

    const rows = Array.from(grouped.values())

    if (rows.length === 0) {
      return NextResponse.json({
        ok: true,
        read_orders: orders?.length || 0,
        synced: 0,
        message: "No había compradores para sincronizar"
      })
    }

    let synced = 0
    let failed = 0
    const errors: string[] = []

    for (const row of rows) {
      const { data: existing, error: existingError } = await supabase
        .from("customer_locations")
        .select("id, lat, lng, geocoding_status, notes")
        .eq("customer_key", row.customer_key)
        .maybeSingle()

      if (existingError) {
        failed += 1
        errors.push(`${row.customer_key}: ${existingError.message}`)
        continue
      }

      if (existing?.id) {
        const updatePayload: any = {
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          address: row.address,
          city: row.city,
          updated_at: row.updated_at
        }

        if (existing.lat === null || existing.lng === null) {
          updatePayload.geocoding_status = "pending"
          updatePayload.notes = row.notes
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

        synced += 1
      } else {
        const { error: insertError } = await supabase
          .from("customer_locations")
          .insert(row)

        if (insertError) {
          failed += 1
          errors.push(`${row.customer_key}: ${insertError.message}`)
          continue
        }

        synced += 1
      }
    }

    return NextResponse.json({
      ok: true,
      read_orders: orders?.length || 0,
      unique_customers: rows.length,
      synced,
      failed,
      errors: errors.slice(0, 10)
    })
  } catch (error: any) {
    console.error("sync customer locations error", error)

    return NextResponse.json(
      { error: error?.message || "Error sincronizando clientes al mapa" },
      { status: 500 }
    )
  }
}
