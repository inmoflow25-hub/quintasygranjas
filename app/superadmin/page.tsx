export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/admin-auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function money(value: number | null | undefined) {
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

function normalizeEmail(email: string | null | undefined) {
  return String(email || "").trim().toLowerCase()
}

export default async function SuperAdminPage() {
  const admin = await requireAdmin()

  const { data: orders, error } = await supabase
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
      is_test,
      order_items (
        id,
        product_name,
        quantity,
        price
      )
    `)
    .eq("is_test", false)
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] p-10">
        <h1 className="mb-6 text-5xl font-serif font-bold text-[#1f2a1f]">
          Superadmin
        </h1>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm text-gray-500">
            Ingresaste como {admin.email}
          </p>

          <p className="text-red-600">
            Error cargando superadmin: {error.message}
          </p>
        </div>
      </main>
    )
  }

  const safeOrders = orders || []

  const confirmedOrders = safeOrders.filter(
    (order: any) => order.status === "confirmed"
  )

  const pendingOrders = safeOrders.filter(
    (order: any) => order.status !== "confirmed"
  )

  const totalSales = confirmedOrders.reduce(
    (acc: number, order: any) => acc + Number(order.price || 0),
    0
  )

  const averageTicket =
    confirmedOrders.length > 0
      ? Math.round(totalSales / confirmedOrders.length)
      : 0

  const customerMap = new Map<string, any>()

  for (const order of confirmedOrders as any[]) {
    const key =
      normalizeEmail(order.customer_email) ||
      String(order.customer_phone || "").trim()

    if (!key) continue

    const current = customerMap.get(key) || {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      orders: 0,
      total: 0,
      lastOrderAt: order.created_at,
      source: order.source
    }

    current.orders += 1
    current.total += Number(order.price || 0)

    if (
      new Date(order.created_at).getTime() >
      new Date(current.lastOrderAt).getTime()
    ) {
      current.lastOrderAt = order.created_at
      current.source = order.source
    }

    customerMap.set(key, current)
  }

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.total - a.total
  )

  const repeatCustomers = customers.filter(
    (customer) => customer.orders >= 2
  )

  const sourceTotals = safeOrders.reduce(
    (
      acc: Record<string, { count: number; total: number }>,
      order: any
    ) => {
      const source = order.source || "sin-source"

      if (!acc[source]) {
        acc[source] = {
          count: 0,
          total: 0
        }
      }

      acc[source].count += 1

      if (order.status === "confirmed") {
        acc[source].total += Number(order.price || 0)
      }

      return acc
    },
    {}
  )

  return (
    <main className="min-h-screen bg-[#f5f5f3] p-8 text-[#1f2a1f]">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Sesión activa: {admin.email}
          </p>

          <h1 className="text-5xl font-serif font-bold">
            Superadmin
          </h1>

          <p className="mt-2 text-gray-600">
            Centro de comando de Quintas y Granjas
          </p>
        </div>

        <a
          href="/admin"
          className="rounded-xl bg-[#1f2a1f] px-4 py-2 text-center text-white"
        >
          Ver admin clásico
        </a>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Ventas confirmadas</p>
          <p className="mt-2 text-4xl font-bold">{money(totalSales)}</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Pedidos confirmados</p>
          <p className="mt-2 text-4xl font-bold">{confirmedOrders.length}</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Ticket promedio</p>
          <p className="mt-2 text-4xl font-bold">{money(averageTicket)}</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Recompradores</p>
          <p className="mt-2 text-4xl font-bold">{repeatCustomers.length}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Clientes únicos</p>
          <p className="mt-2 text-3xl font-bold">{customers.length}</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Pedidos pendientes / no confirmados
          </p>
          <p className="mt-2 text-3xl font-bold">{pendingOrders.length}</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Pedidos totales reales</p>
          <p className="mt-2 text-3xl font-bold">{safeOrders.length}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-serif font-bold">
            Ventas por canal
          </h2>

          <div className="space-y-3">
            {Object.entries(sourceTotals).map(([source, data]: any) => (
              <div
                key={source}
                className="flex items-center justify-between rounded-2xl bg-[#f5f5f3] p-4"
              >
                <div>
                  <p className="font-semibold">{source}</p>
                  <p className="text-sm text-gray-500">
                    {data.count} pedidos
                  </p>
                </div>

                <p className="text-xl font-bold">
                  {money(data.total)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-serif font-bold">
            Mejores clientes
          </h2>

          <div className="space-y-3">
            {customers.slice(0, 8).map((customer) => (
              <div
                key={`${customer.email}-${customer.phone}`}
                className="rounded-2xl bg-[#f5f5f3] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {customer.name || customer.email || customer.phone}
                    </p>

                    <p className="text-sm text-gray-500">
                      {customer.email || "-"} · {customer.phone || "-"}
                    </p>

                    <p className="text-xs text-gray-500">
                      Última compra: {formatDateTime(customer.lastOrderAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">{money(customer.total)}</p>
                    <p className="text-sm text-gray-500">
                      {customer.orders} compras
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-serif font-bold">
          Últimos pedidos
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#efefed] text-[#2b2b2b]">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {safeOrders.slice(0, 20).map((order: any) => {
                const key =
                  normalizeEmail(order.customer_email) ||
                  String(order.customer_phone || "").trim()

                const customer = customerMap.get(key)
                const isRepeat = customer?.orders >= 2

                return (
                  <tr
                    key={order.id}
                    className="border-t border-[#ecece8] align-top"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      {formatDateTime(order.created_at)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {order.customer_name || "-"}
                      </div>

                      {isRepeat && (
                        <div className="mt-1 text-xs font-semibold text-green-700">
                          Recomprador
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div>{order.customer_phone || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {order.customer_email || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4 max-w-[260px]">
                      <div>{order.delivery_address || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {order.delivery_city || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4 max-w-[320px]">
                      {formatItems(order.order_items)}
                    </td>

                    <td className="px-4 py-4">
                      {order.source || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {order.payment_method || "-"} ·{" "}
                      {order.payment_status || "-"}
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {order.status || "-"}
                    </td>

                    <td className="px-4 py-4 font-bold">
                      {money(order.price)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
