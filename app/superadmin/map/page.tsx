export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"
import CustomerMap from "@/components/superadmin/customer-map"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function money(value: number | null | undefined) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`
}

export default async function SuperAdminMapPage() {
  await requireAdmin()

  const { data: customers, error } = await supabase
    .from("real_customers_map")
    .select(`
      real_customer_key,
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      purchases_count,
      total_purchased,
      average_ticket,
      first_order_at,
      last_order_at,
      last_order_id,
      last_order_number,
      main_source,
      main_payment_method,
      last_payment_status,
      address_id,
      real_address,
      real_city,
      address_notes,
      location_id,
      raw_lat,
      raw_lng,
      map_lat,
      map_lng,
      has_pin,
      has_real_coordinate,
      shared_coordinate_count,
      shared_coordinate_index,
      geocoding_status,
      geocoding_notes
    `)
    .order("customer_name", { ascending: true })

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-red-600">Error cargando clientes reales: {error.message}</p>
      </div>
    )
  }

  const safeCustomers = customers || []

  const points = safeCustomers
    .filter((customer: any) => customer.map_lat !== null && customer.map_lng !== null)
    .map((customer: any) => ({
      id: customer.real_customer_key,
      customer_key: customer.real_customer_key,
      customer_name: customer.customer_name || "Cliente",
      customer_email: customer.customer_email || null,
      customer_phone: customer.customer_phone || null,
      address: customer.real_address || "Sin domicilio cargado",
      city: customer.real_city || "Buenos Aires",
      lat: Number(customer.map_lat),
      lng: Number(customer.map_lng),
      geocoding_status: customer.geocoding_status || null,
      notes: customer.has_real_coordinate
        ? customer.geocoding_notes || null
        : "PIN TEMPORAL: falta coordenada real",
      purchases_count: Number(customer.purchases_count || 0),
      total_purchased: Number(customer.total_purchased || 0),
      average_ticket: Number(customer.average_ticket || 0),
      first_order_at: customer.first_order_at || null,
      last_order_at: customer.last_order_at || null,
      last_order_label: customer.last_order_at
        ? new Date(customer.last_order_at).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit"
          })
        : null,
      main_source: customer.main_source || null,
      main_payment_method: customer.main_payment_method || null,
      has_real_coordinate: customer.has_real_coordinate === true
    }))

  const clientesReales = safeCustomers.length
  const clientesConPin = points.length
  const clientesSinPin = Math.max(0, clientesReales - clientesConPin)
  const clientesConPinTemporal = safeCustomers.filter(
    (customer: any) => customer.has_real_coordinate === false
  ).length

  const comprasReales = safeCustomers.reduce(
    (acc: number, customer: any) => acc + Number(customer.purchases_count || 0),
    0
  )

  const totalVendido = safeCustomers.reduce(
    (acc: number, customer: any) => acc + Number(customer.total_purchased || 0),
    0
  )

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-serif font-bold">
          Mapa de clientes reales
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Un pin por cliente real. Si falta coordenada real, el cliente aparece igual con pin temporal.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric title="Clientes reales" value={clientesReales} />
        <Metric title="Clientes con pin" value={clientesConPin} />
        <Metric title="Clientes sin pin" value={clientesSinPin} />
        <Metric title="Pins temporales" value={clientesConPinTemporal} />
        <Metric title="Compras reales" value={comprasReales} />
        <Metric title="Total vendido" value={money(totalVendido)} />
      </section>

      <CustomerMap points={points} />
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
