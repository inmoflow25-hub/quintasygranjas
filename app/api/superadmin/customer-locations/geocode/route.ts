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

function buildQuery(location: any) {
  const parts = [
    location.address,
    location.city,
    "Buenos Aires",
    "Argentina"
  ]

  return parts
    .filter(Boolean)
    .join(", ")
    .replace(/\s+/g, " ")
    .trim()
}

async function geocodeAddress(query: string) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    addressdetails: "1"
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
        geocoding_status
      `)
      .is("lat", null)
      .is("lng", null)
      .in("geocoding_status", ["pending", "error", "not_found"])
      .not("address", "is", null)
      .limit(limit)

    if (error) {
      console.error("load customer_locations error", error)
      return NextResponse.json({ error: "db error" }, { status: 500 })
    }

    let ok = 0
    let notFound = 0
    let failed = 0

    for (const location of locations || []) {
      const query = buildQuery(location)

      try {
        const result = await geocodeAddress(query)

        if (!result) {
          notFound += 1

          await supabase
            .from("customer_locations")
            .update({
              geocoding_status: "not_found",
              notes: `No encontrado: ${query}`,
              updated_at: new Date().toISOString()
            })
            .eq("id", location.id)
        } else {
          ok += 1

          await supabase
            .from("customer_locations")
            .update({
              lat: result.lat,
              lng: result.lng,
              geocoding_status: "ok",
              notes: result.display_name,
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
            notes: `Error geocodificando: ${query}`,
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
