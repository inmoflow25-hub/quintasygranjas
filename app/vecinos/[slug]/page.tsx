export const dynamic = "force-dynamic"
export const revalidate = 0

import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
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

  return (
    <main>
      <Header />

      <section className="bg-green-50 px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Compra comunitaria
          </p>

          <h1 className="mt-2 text-4xl font-serif font-bold">
            {location.name}
          </h1>

          <p className="mt-2 text-gray-600">
            Entrega: <strong>{location.delivery_day || "A definir"}</strong>
            {location.next_delivery_date ? ` · ${location.next_delivery_date}` : ""}
          </p>

          <p className="mt-1 text-gray-600">
            {location.address || "Dirección a definir"}
            {location.city ? ` · ${location.city}` : ""}
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Cada vecino compra separado. En el checkout cargás piso y departamento.
          </p>
        </div>
      </section>

      <VecinosCart location={location} />

      <Footer onWhatsAppClick={() => {}} />
    </main>
  )
}
