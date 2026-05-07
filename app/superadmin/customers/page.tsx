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

function formatDate(dateString: string | null) {
  if (!dateString) return "-"

  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  })
}

function normalizePhone(phone: string | null | undefined) {
  const raw = String(phone || "").replace(/\D/g, "")
  if (!raw) return ""

  let cleaned = raw

  if (cleaned.startsWith("54911")) cleaned = cleaned.slice(3)
  if (cleaned.startsWith("5411")) cleaned = cleaned.slice(2)
  if (cleaned.startsWith("011")) cleaned = cleaned.slice(1)

  if (cleaned.startsWith("15") && cleaned.length >= 10) {
    cleaned = "11" + cleaned.slice(2)
  }

  return cleaned
}

function normalizeEmail(email: string | null | undefined) {
  return String(email || "").trim().toLowerCase()
}

function customerKey(order: any) {
  return (
    normalizePhone(order.customer_phone) ||
    normalizeEmail(order.customer_email) ||
    order.user_id ||
    ""
  )
}

export default async function SuperAdminCustomersPage() {
  await requireAdmin()

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
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
      is_test
    `)
    .eq("is_test", false)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-red-600">Error cargando clientes: {error.message}</p>
      </div>
    )
  }

  const customerMap = new Map<string, any>()

  for (const order of orders || []) {
    const key = customerKey(order)
    if (!key) continue

    const current = customerMap.get(key) || {
      key,
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.delivery_address,
      city: order.delivery_city,
      orders: 0,
      total: 0,
      firstOrderAt: order.created_at,
      lastOrderAt: order.created_at,
      sources: new Map<string, number>(),
      paymentMethods: new Map<string, number>()
    }

    current.orders += 1
    current.total += Number(order.price || 0)

    if (new Date(order.created_at).getTime() < new Date(current.firstOrderAt).getTime()) {
      current.firstOrderAt = order.created_at
    }

    if (new Date(order.created_at).getTime() > new Date(current.lastOrderAt).getTime()) {
      current.lastOrderAt = order.created_at
      current.name = order.customer_name || current.name
      current.email = order.customer_email || current.email
      current.phone = order.customer_phone || current.phone
      current.address = order.delivery_address || current.address
      current.city = order.delivery_city || current.city
    }

    const source = order.source || "sin-source"
    current.sources.set(source, (current.sources.get(source) || 0) + 1)

    const paymentMethod = order.payment_method || "sin-método"
    current.paymentMethods.set(
      paymentMethod,
      (current.paymentMethods.get(paymentMethod) || 0) + 1
    )

    customerMap.set(key, current)
  }

  const customers = Array.from(customerMap.values())
    .map((customer) => {
      const mainSource =
        Array.from(customer.sources.entries()).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "-"

      const mainPaymentMethod =
        Array.from(customer.paymentMethods.entries()).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "-"

      return {
        ...customer,
        averageTicket: customer.orders > 0 ? Math.round(customer.total / customer.orders) : 0,
        mainSource,
        mainPaymentMethod,
        isRepeat: customer.orders >= 2
      }
    })
    .sort((a, b) => b.total - a.total)

  const repeatCustomers = customers.filter((customer) => customer.isRepeat)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric title="Clientes únicos" value={customers.length} />
        <Metric title="Recompradores" value={repeatCustomers.length} />
        <Metric
          title="% recompra"
          value={`${customers.length ? Math.round((repeatCustomers.length / customers.length) * 100) : 0}%`}
        />
        <Metric
          title="Total comprado"
          value={money(customers.reduce((acc, c) => acc + Number(c.total || 0), 0))}
        />
        <Metric
          title="Ticket prom. cliente"
          value={money(
            customers.length
              ? Math.round(customers.reduce((acc, c) => acc + Number(c.averageTicket || 0), 0) / customers.length)
              : 0
          )}
        />
      </section>

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-2xl font-serif font-bold">Clientes</h2>
        <p className="mb-4 text-sm text-gray-500">
          Cliente único = teléfono normalizado primero, email después.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#efefed] text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Compras</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Ticket prom.</th>
                <th className="px-4 py-3">Primera</th>
                <th className="px-4 py-3">Última</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Pago habitual</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.key} className="border-b border-[#eee] align-top">
                  <td className="px-4 py-4">
                    <div className="font-medium">{customer.name || "-"}</div>
                    {customer.isRepeat && (
                      <div className="mt-1 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        Recomprador
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div>{customer.phone || "-"}</div>
                    <div className="text-xs text-gray-500">{customer.email || "-"}</div>
                  </td>

                  <td className="px-4 py-4 max-w-[260px]">
                    <div>{customer.address || "-"}</div>
                    <div className="text-xs text-gray-500">{customer.city || "-"}</div>
                  </td>

                  <td className="px-4 py-4 font-bold">{customer.orders}</td>
                  <td className="px-4 py-4 font-bold">{money(customer.total)}</td>
                  <td className="px-4 py-4">{money(customer.averageTicket)}</td>
                  <td className="px-4 py-4">{formatDate(customer.firstOrderAt)}</td>
                  <td className="px-4 py-4">{formatDate(customer.lastOrderAt)}</td>
                  <td className="px-4 py-4">{customer.mainSource}</td>
                  <td className="px-4 py-4">{customer.mainPaymentMethod}</td>
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
      <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}
