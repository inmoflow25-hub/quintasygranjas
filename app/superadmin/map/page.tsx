export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"
import CustomerMap from "@/components/superadmin/customer-map"
import GeocodeCustomersButton from "@/components/superadmin/geocode-customers-button"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function SuperAdminMapPage() {
  await requireAdmin()

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
      geocoding_status,
      notes
    `)
    .order("customer_name", { ascending: true })

  const { data: commercialLocations, error: commercialError } = await supabase
    .from("commercial_locations")
    .select(`
      id,
      slug,
      name,
      type,
      address,
      city,
      lat,
      lng,
      polygon,
      parent_location_id,
      is_active
    `)
    .eq("is_active", true)
    .in("type", ["cluster", "tower"])
    .order("type", { ascending: true })
    .order("slug", { ascending: true })

  if (error || commercialError) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        {error && <p className="text-red-600">Error cargando clientes: {error.message}</p>}
        {commercialError && <p className="text-red-600">Error cargando torres: {commercialError.message}</p>}
      </div>
    )
  }

  const safeLocations = locations || []

  const points = safeLocations
    .filter((location: any) => location.lat !== null && location.lng !== null)
    .map((location: any) => ({
      ...location,
      lat: Number(location.lat),
      lng: Number(location.lng)
    }))

  const pending = safeLocations.filter(
    (location: any) => location.lat === null || location.lng === null
  )

  const commercial = commercialLocations || []
  const towers = commercial.filter((location: any) => location.type === "tower")
  const clusters = commercial.filter((location: any) => location.type === "cluster")

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold">
            Mapa comercial
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Clientes, torres y manzanas comerciales.
          </p>
        </div>

        <GeocodeCustomersButton />
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric title="Clientes cargados" value={safeLocations.length} />
        <Metric title="Clientes con coordenadas" value={points.length} />
        <Metric title="Clientes pendientes" value={pending.length} />
        <Metric title="Manzanas" value={clusters.length} />
        <Metric title="Torres" value={towers.length} />
      </section>

      <CustomerMap
        points={points}
        commercialLocations={commercial as any}
      />

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-xl font-serif font-bold">
          Torres comerciales
        </h3>

        <div className="grid gap-3 md:grid-cols-3">
          {towers.map((tower: any) => (
            <a
              key={tower.id}
              href={`/vecinos/${tower.slug}`}
              target="_blank"
              className="rounded-2xl bg-[#f5f5f3] p-4 hover:bg-[#ece8df]"
            >
              <p className="font-bold">{tower.name}</p>
              <p className="text-sm text-gray-500">/vecinos/{tower.slug}</p>
              <p className="mt-2 text-sm">
                {tower.address || "Domicilio pendiente"}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl border border-[#e3e1dc] bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}
