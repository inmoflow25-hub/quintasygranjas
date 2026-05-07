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

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-red-600">Error cargando mapa: {error.message}</p>
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

  const okCount = points.length
  const pendingCount = pending.length

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold">
            Mapa de clientes
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Primero mostramos clientes. Después sumamos proveedores, zonas y cuadrículas.
          </p>
        </div>

        <GeocodeCustomersButton />
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric title="Clientes cargados" value={safeLocations.length} />
        <Metric title="Con coordenadas" value={okCount} />
        <Metric title="Pendientes" value={pendingCount} />
        <Metric
          title="% geocodificado"
          value={`${safeLocations.length ? Math.round((okCount / safeLocations.length) * 100) : 0}%`}
        />
      </section>

      <CustomerMap points={points} />

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-xl font-serif font-bold">
          Clientes pendientes de coordenadas
        </h3>

        {pending.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todos los clientes tienen coordenadas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#efefed] text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Dirección</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Notas</th>
                </tr>
              </thead>

              <tbody>
                {pending.map((location: any) => (
                  <tr key={location.id} className="border-b border-[#eee] align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {location.customer_name || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {location.customer_key}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div>{location.customer_phone || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {location.customer_email || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div>{location.address || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {location.city || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {location.geocoding_status || "-"}
                    </td>

                    <td className="px-4 py-4 max-w-[320px] text-xs text-gray-500">
                      {location.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
