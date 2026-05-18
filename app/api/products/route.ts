import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
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
        sort_order
      `)
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("products api error", error)
      return NextResponse.json(
        { error: "Error cargando productos" },
        { status: 500 }
      )
    }

    const products = (data || []).map((product: any) => ({
      id: product.slug || product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price || 0),
      image: product.image || "",
      category: product.category || "otros",
      description: product.description || "",
      type: product.type || "unit",
      unit_label: product.unit_label || "unidad",
      active: Boolean(product.active),
      sort_order: Number(product.sort_order || 0)
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error("products api fatal error", error)

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}
