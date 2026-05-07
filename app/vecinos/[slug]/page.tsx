export const dynamic = "force-dynamic"
export const revalidate = 0

import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

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

  const { data: location, error } = await supabase
    .from("commercial_locations")
    .select(`
      id,
      slug,
      name,
      type,
      address,
      city,
      delivery_day,
      next_delivery_date,
      is_active,
      notes
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !location) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-green-50 px-6 py-10 text-[#1f2a1f]">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-lg">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-700">
          Compra comunitaria
        </p>

        <h1 className="mb-4 text-4xl font-serif font-bold">
          {location.name}
        </h1>

        <p className="mb-6 text-lg text-gray-700">
          Comprá junto a tus vecinos y recibí en el mismo edificio.
        </p>

        <div className="mb-6 rounded-2xl bg-green-100 p-5">
          <p className="text-sm text-gray-600">Entrega para este edificio</p>

          <p className="mt-1 text-xl font-bold">
            {location.delivery_day || "A definir"}
          </p>

          {location.next_delivery_date && (
            <p className="mt-1 text-sm text-gray-600">
              Fecha: {location.next_delivery_date}
            </p>
          )}

          {(location.address || location.city) && (
            <p className="mt-3 text-sm text-gray-700">
              {location.address || ""} {location.city ? `· ${location.city}` : ""}
            </p>
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-green-200 p-5">
          <h2 className="mb-2 text-xl font-bold">
            Importante
          </h2>

          <p className="text-gray-700">
            Cada vecino compra y paga por separado. En el checkout vas a cargar tu piso,
            departamento y datos de contacto.
          </p>
        </div>

        <Link
          href={`/vecinos/${location.slug}/checkout`}
          className="block w-full rounded-2xl bg-green-700 px-6 py-4 text-center text-lg font-bold text-white"
        >
          Comprar para este edificio
        </Link>
      </section>
    </main>
  )
}
