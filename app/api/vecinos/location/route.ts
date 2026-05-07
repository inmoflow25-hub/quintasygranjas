import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const url = new URL(req.url)
  const slug = url.searchParams.get("slug")

  if (!slug) {
    return NextResponse.json({ error: "Falta slug" }, { status: 400 })
  }

  const { data: location, error } = await supabase
    .from("commercial_locations")
    .select(`
      id,
      slug,
      name,
      address,
      city,
      delivery_day,
      next_delivery_date,
      is_active
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !location) {
    return NextResponse.json({ error: "Edificio no encontrado" }, { status: 404 })
  }

  return NextResponse.json({ location })
}
