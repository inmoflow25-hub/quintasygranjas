import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function cleanText(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim()
}

function buildQueries(location: any) {
  const address = cleanText(location.address)
  const city = cleanText(location.city) || "Buenos Aires"

  return Array.from(
    new Set(
      [
        [address, city, "Provincia de Buenos Aires", "Argentina"],
        [address, city, "Buenos Aires", "Argentina"],
        [address, city, "Argentina"],
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

  if (!apiKey) {
    throw new Error("Falta GOOGLE_GEOCODING_API_KEY o GOOGLE_MAPS_API_KEY")
  }

  const params = new URLSearchParams({
    address: query,
    key: apiKey,
    region: "ar"
  })

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  )

  if (!res.ok) {
    throw new Error(`Google geocoding HTTP ${res.status}`)
  }

  const data = await res.json()

  if (data.status === "OVER_QUERY_LIMIT" || data.status === "REQUEST_DENIED") {
    const error: any = new Error(`Google geocoding ${data.status}`)
    error.code = "RATE_LIMIT"
    throw error
  }

  if (data.status !== "OK" || !Array.isArray(data.results) || !data.results.length) {
    return null
  }

  const result = data.results[0]
  const location = result?.geometry?.location

  if (!location) return null

  return {
    lat: Number(location.lat),
    lng: Number(location.lng),
    formatted_address: result.formatted_address || query,
    place_id: result.place_id || null,
    location_type: result.geometry?.location_type || null,
    provider: "google"
  }
}

function isGoodEnoughGoogleResult(result: any) {
  const locationType = String(result?.location_type || "")

  return [
    "ROOFTOP",
    "RANGE_INTERPOLATED",
    "GEOMETRIC_CENTER",
    "APPROXIMATE"
  ].includes(locationType)
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json().catch(() => ({}))
    const limit = Math.min(Number(body?.limit || 10), 25)

    const { data: locations, error } = await supabase
      .from("customer_locations")
      .select(`
        id,
        customer_key,
        customer_name,
        customer_email,
        customer_phone,
        address,
        city,
        lat,
        lng,
        geocoding_status,
        notes
      `)
      .or("lat.is.null,lng.is.null,geocoding_status.eq.pending,geocoding_status.eq.failed_google,geocoding_status.eq.needs_manual_address")
      .not("address", "is", null)
      .limit(limit)

    if (error) {
      console.error("load customer_locations pending geocode error", error)

      return NextResponse.json(
        { error: "No se pudieron leer clientes pendientes de geocoding" },
        { status: 500 }
      )
    }

    let ok = 0
    let notFound = 0
    let lowPrecision = 0
    let failed = 0
    let stoppedByRateLimit = false

    const details: any[] = []

    for (const location of locations || []) {
      const queries = buildQueries(location)

      let found: any = null
      let usedQuery = ""

      try {
        for (const query of queries) {
          usedQuery = query
          found = await geocodeWithGoogle(query)

          if (found) break
        }

        if (!found) {
          notFound += 1

          await supabase
            .from("customer_locations")
            .update({
              geocoding_status: "needs_manual_address",
              notes: `Google no encontró coordenada para: ${queries[0] || location.address}`,
              updated_at: new Date().toISOString()
            })
            .eq("id", location.id)

          details.push({
            customer_key: location.customer_key,
            customer_name: location.customer_name,
            status: "not_found",
            address: location.address,
            city: location.city
          })

          continue
        }

        if (!isGoodEnoughGoogleResult(found)) {
          lowPrecision += 1

          await supabase
            .from("customer_locations")
            .update({
              geocoding_status: "needs_manual_address",
              notes:
                `Google devolvió coordenada imprecisa ` +
                `(${found.location_type || "sin location_type"}): ` +
                `${usedQuery} | ${found.formatted_address}`,
              updated_at: new Date().toISOString()
            })
            .eq("id", location.id)

          details.push({
            customer_key: location.customer_key,
            customer_name: location.customer_name,
            status: "low_precision",
            location_type: found.location_type,
            address: location.address,
            city: location.city,
            google_address: found.formatted_address
          })

          continue
        }

        const geocodingStatus =
          found.location_type === "ROOFTOP"
            ? "ok_google_rooftop"
            : "ok_google_range_interpolated"

        const notes =
          `Google ${found.location_type}: ${usedQuery} | ` +
          `${found.formatted_address}` +
          `${found.place_id ? ` | place_id=${found.place_id}` : ""}`

        const { error: updateError } = await supabase
          .from("customer_locations")
          .update({
            lat: found.lat,
            lng: found.lng,
            geocoding_status: geocodingStatus,
            notes,
            updated_at: new Date().toISOString()
          })
          .eq("id", location.id)

        if (updateError) {
          console.error("customer_locations geocode update error", updateError)

          failed += 1

          details.push({
            customer_key: location.customer_key,
            customer_name: location.customer_name,
            status: "update_failed",
            error: updateError.message
          })

          continue
        }

        // Mantengo también real_customer_map_overrides alimentada,
        // porque la vista actual real_customers_map prioriza esta tabla.
        const { error: overrideError } = await supabase
          .from("real_customer_map_overrides")
          .upsert(
            {
              real_customer_key: location.customer_key,
              customer_name: location.customer_name,
              customer_phone: location.customer_phone,
              customer_email: location.customer_email,
              real_address: location.address,
              real_city: location.city || "Buenos Aires",
              map_lat: found.lat,
              map_lng: found.lng,
              notes,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: "real_customer_key"
            }
          )

        if (overrideError) {
          console.error("real_customer_map_overrides upsert error", overrideError)

          failed += 1

          details.push({
            customer_key: location.customer_key,
            customer_name: location.customer_name,
            status: "override_failed",
            error: overrideError.message
          })

          continue
        }

        ok += 1

        details.push({
          customer_key: location.customer_key,
          customer_name: location.customer_name,
          status: geocodingStatus,
          lat: found.lat,
          lng: found.lng,
          location_type: found.location_type,
          google_address: found.formatted_address
        })
      } catch (error: any) {
        console.error("customer location geocode error", location.customer_key, error)

        failed += 1

        await supabase
          .from("customer_locations")
          .update({
            geocoding_status: "failed_google",
            notes: error?.message || "Error geocodificando con Google",
            updated_at: new Date().toISOString()
          })
          .eq("id", location.id)

        details.push({
          customer_key: location.customer_key,
          customer_name: location.customer_name,
          status: "failed_google",
          error: error?.message || "Error desconocido"
        })

        if (error?.code === "RATE_LIMIT") {
          stoppedByRateLimit = true
          break
        }
      }
    }

    return NextResponse.json({
      ok: true,
      source: "customer_locations",
      processed: locations?.length || 0,
      geocoded: ok,
      not_found: notFound,
      low_precision: lowPrecision,
      failed,
      stopped_by_rate_limit: stoppedByRateLimit,
      details: details.slice(0, 25)
    })
  } catch (error: any) {
    console.error("customer locations geocode route error", error)

    return NextResponse.json(
      { error: error?.message || "Error geocodificando clientes" },
      { status: 500 }
    )
  }
}
