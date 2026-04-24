import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("neighborhood_slug")

  if (!slug) {
    return NextResponse.json(
      { error: "Falta neighborhood_slug" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .rpc("get_neighborhood_progress", {
      p_neighborhood_slug: slug
    })
    .single()

  if (error) {
    console.error("progress error", error)
    return NextResponse.json(
      { error: "No se pudo obtener progreso" },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}
