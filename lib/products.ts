import { createClient } from "@supabase/supabase-js"

export type Product = {
  id: string
  slug: string
  name: string
  price: number
  type: "unit" | "weight_500g" | "weight_1kg"
  unit_label: string
  image: string
  category: string
  description?: string | null
  active: boolean
  sort_order: number
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      slug,
      name,
      price,
      type,
      unit_label,
      image,
      category,
      description,
      active,
      sort_order
    `)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("getActiveProducts error", error)
    return []
  }

  return (data || []).map((product: any) => ({
    id: product.slug || product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price || 0),
    type: product.type || "unit",
    unit_label: product.unit_label || "unidad",
    image: product.image || "",
    category: product.category || "otros",
    description: product.description || "",
    active: Boolean(product.active),
    sort_order: Number(product.sort_order || 0)
  }))
}
