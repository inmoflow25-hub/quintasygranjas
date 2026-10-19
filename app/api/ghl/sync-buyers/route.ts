import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Custom fields reales de GHL - Quintas y Granjas
const GHL_POINTS_FIELD_ID = "B5hHlTvZSSosc2ox3C7y"
const GHL_CASHBACK_FIELD_ID = "yATTTV6mHgo9VGt7hKVx"

type OrderRow = {
  id: string
  user_id: string | null
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

type UserRow = {
  id: string
  email: string | null
}

type UserPointsRow = {
  user_id: string
  points_balance: number | null
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
  tags,
  pointsAvailable,
  cashbackAvailableArs
}: {
  name: string
  email: string
  phone: string
  tags: string[]
  pointsAvailable: number
  cashbackAvailableArs: number
}) {
  const token = process.env.GHL_API_TOKEN
  const locationId = process.env.GHL_LOCATION_ID

  if (!token || !locationId) {
    throw new Error("Faltan GHL_API_TOKEN o GHL_LOCATION_ID en Vercel")
  }

  const body: any = {
    locationId,
    firstName: name,
    tags,
    customFields: [
      {
        id: GHL_POINTS_FIELD_ID,
        fieldValue: String(pointsAvailable)
      },
      {
        id: GHL_CASHBACK_FIELD_ID,
        fieldValue: String(cashbackAvailableArs)
      }
    ]
  }

  if (email) body.email = email
  if (phone) body.phone = phone

  const response = await fetch(
    "https://services.leadconnectorhq.com/contacts/upsert",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    console.error("GHL upsert error", data)

    throw new Error(
      data?.message || "Error creando/actualizando contacto en GHL"
    )
  }

  return data
}

async function runSync() {
  try {
    /*
     * 1. COMPRADORES
     */
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

    if (ordersError) {
      console.error("orders fetch error", ordersError)

      return NextResponse.json(
        {
          ok: false,
          error: "No se pudieron leer compradores"
        },
        {
          status: 500
        }
      )
    }

    /*
     * 2. USUARIOS
     *
     * Esto sirve para órdenes históricas donde user_id puede venir null,
     * pero tenemos el email del comprador.
     */
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        email
      `)

    if (usersError) {
      console.error("users fetch error", usersError)

      return NextResponse.json(
        {
          ok: false,
          error: "No se pudieron leer usuarios"
        },
        {
          status: 500
        }
      )
    }

    /*
     * 3. SALDOS DE PUNTOS
     */
    const { data: pointsRows, error: pointsError } = await supabase
      .from("user_points")
      .select(`
        user_id,
        points_balance
      `)

    if (pointsError) {
      console.error("user_points fetch error", pointsError)

      return NextResponse.json(
        {
          ok: false,
          error: "No se pudieron leer los puntos"
        },
        {
          status: 500
        }
      )
    }

    /*
     * 4. VALOR ACTUAL DEL PUNTO
     *
     * No clavamos $2 en el código.
     * Lo leemos de app_points_config para que si cambia la regla,
     * cambie también lo que mandamos a GHL.
     */
    const {
      data: pointsConfigRows,
      error: pointsConfigError
    } = await supabase
      .from("app_points_config")
      .select(`
        point_value_ars
      `)
      .limit(1)

    if (pointsConfigError) {
      console.error("app_points_config fetch error", pointsConfigError)

      return NextResponse.json(
        {
          ok: false,
          error: "No se pudo leer la configuración de puntos"
        },
        {
          status: 500
        }
      )
    }

    const pointValueArs = Number(
      pointsConfigRows?.[0]?.point_value_ars
    )

    if (!Number.isFinite(pointValueArs) || pointValueArs <= 0) {
      console.error(
        "point_value_ars inválido",
        pointsConfigRows?.[0]?.point_value_ars
      )

      return NextResponse.json(
        {
          ok: false,
          error: "point_value_ars no está configurado correctamente"
        },
        {
          status: 500
        }
      )
    }

    /*
     * 5. MAPA EMAIL -> USER_ID
     */
    const userIdByEmail = new Map<string, string>()

    for (const user of (users || []) as UserRow[]) {
      const email = normalizeEmail(user.email)

      if (!email || !user.id) continue

      userIdByEmail.set(email, user.id)
    }

    /*
     * 6. MAPA USER_ID -> PUNTOS
     */
    const pointsByUserId = new Map<string, number>()

    for (const row of (pointsRows || []) as UserPointsRow[]) {
      if (!row.user_id) continue

      const points = Math.max(
        0,
        Math.floor(Number(row.points_balance || 0))
      )

      pointsByUserId.set(row.user_id, points)
    }

    /*
     * Ya NO filtramos por payment_status.
     * Todo lo que esté confirmed en orders entra.
     */
    const validOrders = (orders || []) as OrderRow[]

    /*
     * Preservamos la misma lógica original:
     * primero se agrupa por teléfono y, si no hay, por email.
     */
    const buyers = new Map<
      string,
      {
        userId: string | null
        name: string
        email: string
        phone: string
        totalOrders: number
        totalSpent: number
        lastOrderAt: string
        deliveryCity: string
      }
    >()

    for (const order of validOrders) {
      const key = getBuyerKey(order)

      if (!key) continue

      const phone = normalizeArgentinaPhone(order.customer_phone)
      const email = normalizeEmail(order.customer_email)
      const amount = Number(order.final_price || order.price || 0)
      const deliveryCity = normalizeText(order.delivery_city)

      /*
       * Si la orden ya tiene user_id, usamos ese.
       *
       * Si es una orden histórica sin user_id,
       * intentamos resolverlo por email.
       */
      const resolvedUserId =
        order.user_id ||
        (email ? userIdByEmail.get(email) || null : null)

      const existing = buyers.get(key)

      if (!existing) {
        buyers.set(key, {
          userId: resolvedUserId,
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

        /*
         * Si todavía no habíamos podido encontrar user_id
         * y aparece en otra orden del mismo comprador,
         * lo conservamos.
         */
        if (!existing.userId && resolvedUserId) {
          existing.userId = resolvedUserId
        }

        if (
          new Date(order.created_at) >
          new Date(existing.lastOrderAt)
        ) {
          existing.lastOrderAt = order.created_at

          existing.name =
            normalizeText(order.customer_name) ||
            existing.name

          existing.email =
            email ||
            existing.email

          existing.phone =
            phone ||
            existing.phone

          existing.deliveryCity =
            deliveryCity ||
            existing.deliveryCity
        }
      }
    }

    let synced = 0
    let failed = 0

    let withPoints = 0
    let withoutPoints = 0

    const errors: Array<{
      buyer: string
      error: string
    }> = []

    /*
     * 7. SINCRONIZAR CADA COMPRADOR CON GHL
     */
    for (const buyer of buyers.values()) {
      /*
       * Dejamos los tags EXACTAMENTE con la lógica que ya existía.
       */
      const tags = [
        "compro_ok",
        "comprador_quintas_y_granjas",
        getLoyaltyTag(buyer.totalOrders)
      ]

      const barrioTag = getBarrioTag(
        buyer.deliveryCity
      )

      if (barrioTag) {
        tags.push(barrioTag)
      }

      const uniqueTags = [...new Set(tags)]

      /*
       * Saldo actual.
       *
       * Si no encontramos user_id o no existe registro de puntos,
       * se manda 0.
       */
      const pointsAvailable =
        buyer.userId
          ? Math.max(
              0,
              Math.floor(
                pointsByUserId.get(buyer.userId) || 0
              )
            )
          : 0

      /*
       * Conversión dinámica usando app_points_config.point_value_ars
       */
      const cashbackAvailableArs = Math.round(
        pointsAvailable * pointValueArs
      )

      if (pointsAvailable > 0) {
        withPoints += 1
      } else {
        withoutPoints += 1
      }

      try {
        await upsertGhlContact({
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
          tags: uniqueTags,
          pointsAvailable,
          cashbackAvailableArs
        })

        synced += 1
      } catch (error: any) {
        failed += 1

        errors.push({
          buyer:
            buyer.phone ||
            buyer.email ||
            buyer.name,
          error:
            error?.message ||
            "Error desconocido"
        })
      }
    }

    /*
     * 8. RESPUESTA
     */
    return NextResponse.json({
      ok: true,

      total_buyers: buyers.size,

      synced,
      failed,

      with_points: withPoints,
      without_points: withoutPoints,

      point_value_ars: pointValueArs,

      ghl_fields: {
        puntos_disponibles:
          "contact.puntos_disponibles",

        cashback_disponible_ars:
          "contact.cashback_disponible_ars"
      },

      errors: errors.slice(0, 20)
    })
  } catch (error: any) {
    console.error(
      "sync buyers ghl error",
      error
    )

    return NextResponse.json(
      {
        ok: false,

        error:
          error?.message ||
          "Error interno sincronizando GHL"
      },
      {
        status: 500
      }
    )
  }
}

/*
 * EJECUCIÓN MANUAL
 *
 * POST /api/ghl/sync-buyers
 */
export async function POST() {
  return runSync()
}

/*
 * EJECUCIÓN AUTOMÁTICA DESDE VERCEL CRON
 *
 * GET /api/ghl/sync-buyers
 *
 * Vercel manda automáticamente:
 * Authorization: Bearer ${CRON_SECRET}
 */
export async function GET(req: Request) {
  const cronSecret =
    process.env.CRON_SECRET

  if (!cronSecret) {
    console.error(
      "CRON_SECRET no configurado"
    )

    return NextResponse.json(
      {
        ok: false,
        error: "CRON_SECRET no configurado"
      },
      {
        status: 500
      }
    )
  }

  const authorization =
    req.headers.get("authorization")

  if (
    authorization !==
    `Bearer ${cronSecret}`
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized"
      },
      {
        status: 401
      }
    )
  }

  return runSync()
}
