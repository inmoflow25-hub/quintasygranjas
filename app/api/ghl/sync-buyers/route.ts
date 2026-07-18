import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type OrderRow = {
  id: string
  created_at: string
  source: string | null
  status: string | null
  payment_method: string | null
  payment_status: string | null
  price: number | null
  final_price: number | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  delivery_city: string | null
  is_test: boolean | null
}

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

function normalizeText(value: string | null | undefined) {
  return String(value || "").trim()
}

function slugifyTagPart(value: string | null | undefined) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function getBuyerKey(order: OrderRow) {
  const phone = normalizeArgentinaPhone(order.customer_phone)
  const email = normalizeEmail(order.customer_email)

  if (phone) return phone
  if (email) return email

  return ""
}

function getLoyaltyTag(totalOrders: number) {
  const cyclePosition = totalOrders % 4

  if (cyclePosition === 1) return "loyalty_1_de_4"
  if (cyclePosition === 2) return "loyalty_2_de_4"
  if (cyclePosition === 3) return "loyalty_3_de_4"

  return "loyalty_4_de_4"
}

function getBarrioTag(deliveryCity: string | null | undefined) {
  const slug = slugifyTagPart(deliveryCity)
  if (!slug) return null
  return `barrio_${slug}`
}

async function upsertGhlContact({
  name,
  email,
  phone,
  tags
}: {
  name: string
  email: string
  phone: string
  tags: string[]
}) {
  const token = process.env.GHL_API_TOKEN
  const locationId = process.env.GHL_LOCATION_ID

  if (!token || !locationId) {
    throw new Error("Faltan GHL_API_TOKEN o GHL_LOCATION_ID en Vercel")
  }

  const body: any = {
    locationId,
    firstName: name,
    tags
  }

  if (email) body.email = email
  if (phone) body.phone = phone

  const response = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: "2021-07-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    console.error("GHL upsert error", data)
    throw new Error(data?.message || "Error creando/actualizando contacto en GHL")
  }

  return data
}

export async function POST() {
  try {
    await requireAdmin()

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        source,
        status,
        payment_method,
        payment_status,
        price,
        final_price,
        customer_name,
        customer_email,
        customer_phone,
        delivery_city,
        is_test
      `)
      .eq("status", "confirmed")
      .eq("is_test", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("orders fetch error", error)
      return NextResponse.json(
        { ok: false, error: "No se pudieron leer compradores" },
        { status: 500 }
      )
    }

    // Ya NO filtramos por payment_status.
    // Todo lo que esté confirmado en orders entra.
    const validOrders = (orders || []) as OrderRow[]

    const buyers = new Map<string, {
      name: string
      email: string
      phone: string
      totalOrders: number
      totalSpent: number
      lastOrderAt: string
      deliveryCity: string
    }>()

    for (const order of validOrders) {
      const key = getBuyerKey(order)

      if (!key) continue

      const phone = normalizeArgentinaPhone(order.customer_phone)
      const email = normalizeEmail(order.customer_email)
      const amount = Number(order.final_price || order.price || 0)
      const deliveryCity = normalizeText(order.delivery_city)

      const existing = buyers.get(key)

      if (!existing) {
        buyers.set(key, {
          name: normalizeText(order.customer_name) || "Cliente",
          email,
          phone,
          totalOrders: 1,
          totalSpent: amount,
          lastOrderAt: order.created_at,
          deliveryCity
        })
      } else {
        existing.totalOrders += 1
        existing.totalSpent += amount

        if (new Date(order.created_at) > new Date(existing.lastOrderAt)) {
          existing.lastOrderAt = order.created_at
          existing.name = normalizeText(order.customer_name) || existing.name
          existing.email = email || existing.email
          existing.phone = phone || existing.phone
          existing.deliveryCity = deliveryCity || existing.deliveryCity
        }
      }
    }

    let synced = 0
    let failed = 0
    const errors: Array<{ buyer: string; error: string }> = []

    for (const buyer of buyers.values()) {
      const tags = [
        "comprador_quintas_y_granjas",
        getLoyaltyTag(buyer.totalOrders)
      ]

      const barrioTag = getBarrioTag(buyer.deliveryCity)
      if (barrioTag) {
        tags.push(barrioTag)
      }

      const uniqueTags = [...new Set(tags)]

      try {
        await upsertGhlContact({
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
          tags: uniqueTags
        })

        synced += 1
      } catch (error: any) {
        failed += 1
        errors.push({
          buyer: buyer.phone || buyer.email || buyer.name,
          error: error?.message || "Error desconocido"
        })
      }
    }

    return NextResponse.json({
      ok: true,
      total_buyers: buyers.size,
      synced,
      failed,
      errors: errors.slice(0, 20)
    })
  } catch (error: any) {
    console.error("sync buyers ghl error", error)

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Error interno sincronizando GHL"
      },
      { status: 500 }
    )
  }
}

