import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        slug,
        name,
        price,
        image,
        category,
        description,
        type,
        unit_label,
        active,
        sort_order,
        visible_on_web,
        visible_on_pwa,
        app_exclusive,
        app_promo,
        promo_label,
        points_multiplier
      `)
      .eq("active", true)
      .eq("visible_on_pwa", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("app products lookup error", error)

      return NextResponse.json(
        { error: "No se pudieron consultar los productos" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      products: (products || []).map((product: any) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price || 0),
        image: product.image || "",
        category: product.category || "",
        description: product.description || "",
        type: product.type || "unit",
        unit_label: product.unit_label || "",
        active: product.active === true,
        sort_order: Number(product.sort_order || 0),
        visible_on_web: product.visible_on_web !== false,
        visible_on_pwa: product.visible_on_pwa !== false,
        app_exclusive: product.app_exclusive === true,
        app_promo: product.app_promo === true,
        promo_label: product.promo_label || "",
        points_multiplier: Number(product.points_multiplier || 1)
      }))
    })
  } catch (error: any) {
    console.error("app products route error", error)

    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
