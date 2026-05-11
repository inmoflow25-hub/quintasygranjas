export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function money(value: number | string | null | undefined) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return "-"

  return new Date(dateString).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function formatItems(items: any[] | null | undefined) {
  if (!items || items.length === 0) return "-"

  return items
    .map((item) => `${item.product_name} x${item.quantity}`)
    .join(" · ")
}

export default async function SuperAdminTorresPage() {
  await requireAdmin()

  const { data: clusters, error: clustersError } = await supabase
    .from("commercial_cluster_progress")
    .select("*")
    .order("cluster_name", { ascending: true })

  const { data: towers, error: towersError } = await supabase
    .from("commercial_tower_progress")
    .select("*")
    .order("tower_slug", { ascending: true })

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      source,
      status,
      payment_method,
      payment_status,
      price,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      delivery_notes,
      apartment_floor,
      apartment_unit,
      commercial_location_id,
      commercial_locations (
        id,
        slug,
        name,
        parent_location_id
      ),
      order_items (
        id,
        product_name,
        quantity,
        price
      )
    `)
    .eq("source", "vecinos")
    .eq("is_test", false)
    .order("created_at", { ascending: false })

  if (clustersError || towersError || ordersError) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-3xl font-serif font-bold">Torres</h2>

        {clustersError && (
          <p className="text-red-600">
            Error clusters: {clustersError.message}
          </p>
        )}

        {towersError && (
          <p className="text-red-600">
            Error torres: {towersError.message}
          </p>
        )}

        {ordersError && (
          <p className="text-red-600">
            Error pedidos: {ordersError.message}
          </p>
        )}
      </div>
    )
  }

  const cluster = clusters?.[0]
  const safeTowers = towers || []
  const safeOrders = orders || []

  const confirmedOrders = safeOrders.filter(
    (order: any) => order.status === "confirmed"
  )

  const totalRevenue = confirmedOrders.reduce(
    (acc: number, order: any) => acc + Number(order.price || 0),
    0
  )

  const uniqueApartments = new Set(
    confirmedOrders
      .map((order: any) => {
        const tower = order.commercial_locations?.slug || ""
        const floor = String(order.apartment_floor || "").trim()
        const unit = String(order.apartment_unit || "").trim()

        if (!tower || !floor || !unit) return ""

        return `${tower}-${floor}-${unit}`.toLowerCase()
      })
      .filter(Boolean)
  )

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Manzana comercial
        </p>

        <h2 className="mt-2 text-4xl font-serif font-bold">
          {cluster?.cluster_name || "Manzana Azcuénaga / Vergara / Tapiales / San Martín"}
        </h2>

        <p className="mt-2 text-gray-600">
          Beneficio calculado por manzana completa. Las 6 torres suman al mismo objetivo.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Metric
          title="Facturación"
          value={money(cluster?.confirmed_revenue ?? totalRevenue)}
        />

        <Metric
          title="Pedidos"
          value={cluster?.confirmed_orders ?? confirmedOrders.length}
        />

        <Metric
          title="Clientes"
          value={cluster?.unique_customers ?? "-"}
        />

        <Metric
          title="Deptos compradores"
          value={uniqueApartments.size}
        />

        <Metric
          title="Penetración"
          value={`${cluster?.penetration_percent ?? 0}%`}
        />

        <Metric
          title="Beneficio"
          value={`${cluster?.benefit_discount_percent ?? 0}%`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ProgressPanel
          title="Progreso por facturación"
          current={Number(cluster?.confirmed_revenue || 0)}
          target={Number(cluster?.benefit_threshold_amount || 0)}
          percent={Number(cluster?.revenue_progress_percent || 0)}
          formatter={money}
        />

        <ProgressPanel
          title="Progreso por pedidos"
          current={Number(cluster?.confirmed_orders || 0)}
          target={Number(cluster?.benefit_threshold_orders || 0)}
          percent={Number(cluster?.orders_progress_percent || 0)}
          formatter={(value) => `${value}`}
        />
      </section>

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-2xl font-serif font-bold">
          Torres
        </h3>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {safeTowers.map((tower: any) => (
            <a
              key={tower.tower_id}
              href={`/vecinos/${tower.tower_slug}`}
              target="_blank"
              className="rounded-3xl border border-[#e3e1dc] bg-[#f5f5f3] p-5 hover:border-[#1f2a1f]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xl font-bold">
                    {tower.tower_name}
                  </h4>

                  <p className="mt-1 text-sm text-gray-500">
                    /vecinos/{tower.tower_slug}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold">
                  {tower.confirmed_orders} pedidos
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-gray-500">Facturación</p>
                  <p className="font-bold">
                    {money(tower.confirmed_revenue)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-3">
                  <p className="text-gray-500">Clientes</p>
                  <p className="font-bold">
                    {tower.unique_customers}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                {tower.address || "Domicilio pendiente"}
                {tower.city ? ` · ${tower.city}` : ""}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-2xl font-serif font-bold">
          Pedidos de vecinos
        </h3>

        <p className="mb-4 text-sm text-gray-500">
          Detalle por torre, cliente, piso/depto, productos y pago.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#efefed] text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Torre</th>
                <th className="px-4 py-3">Piso/Depto</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {safeOrders.map((order: any) => (
                <tr key={order.id} className="border-b border-[#eee] align-top">
                  <td className="px-4 py-4 whitespace-nowrap">
                    {formatDateTime(order.created_at)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-semibold">
                      {order.commercial_locations?.name || "-"}
                    </div>

                    <div className="text-xs text-gray-500">
                      {order.commercial_locations?.slug || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4 font-bold">
                    {order.apartment_floor || "-"} / {order.apartment_unit || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {order.customer_name || "-"}
                    </div>

                    <div className="text-xs text-gray-500">
                      {order.customer_email || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {order.customer_phone || "-"}
                  </td>

                  <td className="px-4 py-4 max-w-[320px]">
                    {formatItems(order.order_items)}
                  </td>

                  <td className="px-4 py-4">
                    <div>{order.payment_method || "-"}</div>
                    <div className="text-xs text-gray-500">
                      {order.payment_status || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {order.status || "-"}
                  </td>

                  <td className="px-4 py-4 text-right font-bold">
                    {money(order.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl border border-[#e3e1dc] bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  )
}

function ProgressPanel({
  title,
  current,
  target,
  percent,
  formatter
}: {
  title: string
  current: number
  target: number
  percent: number
  formatter: (value: number) => string
}) {
  const safePercent = Math.max(0, Math.min(100, percent || 0))

  return (
    <div className="rounded-3xl border border-[#e3e1dc] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-serif font-bold">
          {title}
        </h3>

        <span className="font-bold">
          {safePercent}%
        </span>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-[#e7e3da]">
        <div
          className="h-full rounded-full bg-green-700"
          style={{ width: `${safePercent}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-gray-600">
        {formatter(current)} / {formatter(target)}
      </p>
    </div>
  )
}
