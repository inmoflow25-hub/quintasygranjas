export const dynamic = "force-dynamic"
export const revalidate = 0

import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import VecinosCart from "@/components/vecinos/vecinos-cart"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function VecinosPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: location } = await supabase
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

  if (!location) {
    notFound()
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      type,
      image,
      category,
      description
    `)
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  if (productsError) {
    return (
      <main className="min-h-screen bg-green-50 p-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow">
          <p className="text-red-600">
            Error cargando productos: {productsError.message}
          </p>
        </div>
      </main>
    )
  }

  return (
    <VecinosCart
      location={location}
      products={products || []}
    />
  )
}
