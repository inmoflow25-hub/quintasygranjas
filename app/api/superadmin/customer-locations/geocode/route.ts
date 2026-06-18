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
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
}

function buildQueries(location: any) {
  const address = cleanText(location.address)
  const city = cleanText(location.city)

  const queries = [
    [address, city, "Buenos Aires", "Argentina"],
    [address, city, "Provincia de Buenos Aires", "Argentina"],
    [address, "Buenos Aires", "Argentina"],
    [address, "Argentina"]
  ]
    .map((parts) => parts.filter(Boolean).join(", "))
    .map((query) => cleanText(query))
    .filter(Boolean)

  return Array.from(new Set(queries))
}

async function geocodeAddress(query: string) {
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
        "User-Agent": "QuintasYGranjas/1.0 contacto@quintasygranjas.com"
      }
    }
  )

  if (!res.ok) {
    throw new Error(`Nominatim error ${res.status}`)
  }

  const data = await res.json()

  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    display_name: data[0].display_name
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json().catch(() => ({}))
    const limit = Math.min(Number(body?.limit || 25), 25)

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
        geocoding_status
      `)
      .is("lat", null)
      .is("lng", null)
      .not("address", "is", null)
      .or("geocoding_status.is.null,geocoding_status.eq.pending")
      .limit(limit)

    if (error) {
      console.error("load customer_locations error", error)

      return NextResponse.json(
        { error: "No se pudieron leer clientes pendientes" },
        { status: 500 }
      )
    }

    let ok = 0
    let notFound = 0
    let failed = 0

    for (const location of locations || []) {
      const queries = buildQueries(location)

      let found: any = null
      let usedQuery = ""

      try {
        for (const query of queries) {
          usedQuery = query
          found = await geocodeAddress(query)

          if (found) break

          await sleep(1100)
        }

        if (!found) {
          notFound += 1

          await supabase
            .from("customer_locations")
            .update({
              geocoding_status: "not_found",
              notes: `No encontrado. Intentos: ${queries.join(" || ")}`,
              updated_at: new Date().toISOString()
            })
            .eq("id", location.id)
        } else {
          ok += 1

          await supabase
            .from("customer_locations")
            .update({
              lat: found.lat,
              lng: found.lng,
              geocoding_status: "ok",
              notes: `Encontrado con: ${usedQuery} | ${found.display_name}`,
              updated_at: new Date().toISOString()
            })
            .eq("id", location.id)
        }
      } catch (error) {
        console.error("geocode error", location.id, error)

        failed += 1

        await supabase
          .from("customer_locations")
          .update({
            geocoding_status: "error",
            notes: `Error geocodificando. Último intento: ${usedQuery}`,
            updated_at: new Date().toISOString()
          })
          .eq("id", location.id)
      }

      await sleep(1100)
    }

    return NextResponse.json({
      ok: true,
      processed: locations?.length || 0,
      geocoded: ok,
      not_found: notFound,
      failed
    })
  } catch (error) {
    console.error("customer geocode route error", error)

    return NextResponse.json(
      { error: "Error geocodificando clientes" },
      { status: 500 }
    )
  }
}
