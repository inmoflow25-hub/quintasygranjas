import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cleanText(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim()
}

function buildQueries(customer: any) {
  const address = cleanText(customer.real_address)
  const city = cleanText(customer.real_city)

  return Array.from(
    new Set(
      [
        [address, city, "Argentina"],
        [address, city, "Buenos Aires", "Argentina"],
        [address, city, "Provincia de Buenos Aires", "Argentina"],
        [address, "Argentina"]
      ]
        .map((parts) => parts.filter(Boolean).join(", "))
        .map(cleanText)
        .filter(Boolean)
    )
  )
}

async function geocodeWithGoogle(query: string) {
  const apiKey =
    process.env.GOOGLE_GEOCODING_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) return null

  const params = new URLSearchParams({
    address: query,
    key: apiKey,
    region: "ar"
  })

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  )

  if (!res.ok) throw new Error(`Google geocoding error ${res.status}`)

  const data = await res.json()

  if (data.status === "OVER_QUERY_LIMIT" || data.status === "REQUEST_DENIED") {
    const error: any = new Error(`Google geocoding ${data.status}`)
    error.code = "RATE_LIMIT"
    throw error
  }

  if (data.status !== "OK" || !Array.isArray(data.results) || !data.results.length) {
    return null
  }

  const location = data.results[0]?.geometry?.location

  if (!location) return null

  return {
    lat: Number(location.lat),
    lng: Number(location.lng),
    display_name: data.results[0].formatted_address || query,
    provider: "google"
  }
}

async function geocodeWithNominatim(query: string) {
  await sleep(1300)

  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    addressdetails: "1",
    countrycodes: "ar"
  })

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        "User-Agent": "QuintasYGranjas/1.0 contacto@quintasygranjas.com",
        "Accept": "application/json"
      }
    }
  )

  if (res.status === 403 || res.status === 429) {
    const error: any = new Error(`Nominatim rate limit ${res.status}`)
    error.code = "RATE_LIMIT"
    throw error
  }

  if (!res.ok) throw new Error(`Nominatim error ${res.status}`)

  const data = await res.json()

  if (!Array.isArray(data) || data.length === 0) return null

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    display_name: data[0].display_name,
    provider: "nominatim"
  }
}

async function geocodeAddress(query: string) {
  const googleResult = await geocodeWithGoogle(query)

  if (googleResult) return googleResult

  return geocodeWithNominatim(query)
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json().catch(() => ({}))
    const limit = Math.min(Number(body?.limit || 5), 10)

    const { data: customers, error } = await supabase
      .from("real_customers_map")
      .select(`
        real_customer_key,
        customer_name,
        customer_phone,
        customer_email,
        real_address,
        real_city,
        has_pin,
        map_lat,
        map_lng
      `)
      .or("has_pin.eq.false,map_lat.is.null,map_lng.is.null")
      .not("real_address", "is", null)
      .limit(limit)

    if (error) {
      console.error("load real_customers_map error", error)

      return NextResponse.json(
        { error: "No se pudieron leer clientes reales pendientes" },
        { status: 500 }
      )
    }

    let ok = 0
    let notFound = 0
    let failed = 0
    let stoppedByRateLimit = false

    for (const customer of customers || []) {
      const queries = buildQueries(customer)

      let found: any = null
      let usedQuery = ""

      try {
        for (const query of queries) {
          usedQuery = query
          found = await geocodeAddress(query)

          if (found) break
        }

        if (!found) {
          notFound += 1
          continue
        }

        const { error: upsertError } = await supabase
          .from("real_customer_map_overrides")
          .upsert(
            {
              real_customer_key: customer.real_customer_key,
              customer_name: customer.customer_name,
              customer_phone: customer.customer_phone,
              customer_email: customer.customer_email,
              real_address: customer.real_address,
              real_city: customer.real_city || "Buenos Aires",
              map_lat: found.lat,
              map_lng: found.lng,
              notes: `Geocodificado con ${found.provider}: ${usedQuery} | ${found.display_name}`,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: "real_customer_key"
            }
          )

        if (upsertError) {
          console.error("override upsert error", upsertError)
          failed += 1
          continue
        }

        ok += 1
      } catch (error: any) {
        console.error("real customer geocode error", customer.real_customer_key, error)

        failed += 1

        if (error?.code === "RATE_LIMIT") {
          stoppedByRateLimit = true
          break
        }
      }
    }

    return NextResponse.json({
      ok: true,
      processed: customers?.length || 0,
      geocoded: ok,
      not_found: notFound,
      failed,
      stopped_by_rate_limit: stoppedByRateLimit
    })
  } catch (error) {
    console.error("real customer geocode route error", error)

    return NextResponse.json(
      { error: "Error geocodificando clientes reales" },
      { status: 500 }
    )
  }
}
