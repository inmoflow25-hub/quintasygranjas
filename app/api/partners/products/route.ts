import { NextRequest, NextResponse } from "next/server"
import { getPartnerByToken, partnerSupabase } from "@/lib/partner-auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const accessToken = request.nextUrl.searchParams.get("access_token")

  const { partner, error, status } = await getPartnerByToken(accessToken)

  if (!partner) {
    return NextResponse.json({ error }, { status })
  }

  const { data: products, error: productsError } = await partnerSupabase
    .from("products")
    .select(`
      id,
      name,
      price,
      category,
      unit_label,
      type,
      active,
      visible_on_web,
      visible_on_pwa,
      updated_at
    `)
    .eq("active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (productsError) {
    console.error("partners products error", productsError)

    return NextResponse.json(
      { error: "No se pudieron cargar los productos" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    partner: {
      id: partner.id,
      name: partner.name,
      can_update_prices: partner.can_update_prices,
      can_log_expenses: partner.can_log_expenses
    },
    products: products || []
  })
}
