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

function normalizeEmail(email: string | null | undefined) {
  return String(email || "").trim().toLowerCase()
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

function customerKey(order: any) {
  return normalizePhone(order.customer_phone) || normalizeEmail(order.customer_email) || order.user_id || ""
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  })
}

export default async function SuperAdminPage() {
  await requireAdmin()

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      created_at,
      source,
app_context,
affiliate_slug,
campaign_source,
landing_path,
attribution_label,
affiliate_discount_percent,
affiliate_discount_amount,
status,
      payment_method,
      payment_status,
      price,
      customer_name,
      customer_email,
      customer_phone,
      delivery_city,
      neighborhood_id,
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
    return <p className="text-red-600">Error cargando dashboard: {error.message}</p>
  }

  const allOrders = orders || []
  const confirmed = allOrders.filter((o: any) => o.status === "confirmed")
  const cancelled = allOrders.filter((o: any) => o.status === "cancelled")

  const totalSales = confirmed.reduce(
    (acc: number, o: any) => acc + Number(o.price || 0),
    0
  )

  const averageTicket =
    confirmed.length > 0 ? Math.round(totalSales / confirmed.length) : 0

  const customersMap = new Map<string, any>()

  for (const order of confirmed as any[]) {
    const key = customerKey(order)
    if (!key) continue

    const current = customersMap.get(key) || {
      key,
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

    if (new Date(order.created_at).getTime() > new Date(current.lastOrderAt).getTime()) {
      current.lastOrderAt = order.created_at
      current.name = order.customer_name || current.name
      current.source = order.source || current.source
    }

    customersMap.set(key, current)
  }

  const customers = Array.from(customersMap.values()).sort((a, b) => b.total - a.total)
  const repeatCustomers = customers.filter((c) => c.orders >= 2)

const salesBySource = confirmed.reduce((acc: Record<string, any>, order: any) => {
  const source = order.app_context === "pwa" ? "App" : "Web"

  if (!acc[source]) {
    acc[source] = {
      source,
      count: 0,
      total: 0
    }
  }

  acc[source].count += 1
  acc[source].total += Number(order.price || 0)

  return acc
}, {})

const salesByAttribution = confirmed.reduce((acc: Record<string, any>, order: any) => {
  const key = order.affiliate_slug || "sin-atribucion"
  const label = order.attribution_label || "Sin atribución"

  if (!acc[key]) {
    acc[key] = {
      key,
      label,
      count: 0,
      total: 0,
      discount: 0
    }
  }

  acc[key].count += 1
  acc[key].total += Number(order.price || 0)
  acc[key].discount += Number(order.affiliate_discount_amount || 0)

  return acc
}, {})

  const salesByPayment = confirmed.reduce((acc: Record<string, any>, order: any) => {
    const method = order.payment_method || "sin-método"

    if (!acc[method]) {
      acc[method] = {
        method,
        count: 0,
        total: 0
      }
    }

    acc[method].count += 1
    acc[method].total += Number(order.price || 0)

    return acc
  }, {})

  const productMap = new Map<string, any>()

  for (const order of confirmed as any[]) {
    for (const item of order.order_items || []) {
      const name = item.product_name || "Producto"

      const current = productMap.get(name) || {
        name,
        quantity: 0,
        total: 0
      }

      current.quantity += Number(item.quantity || 0)
      current.total += Number(item.quantity || 0) * Number(item.price || 0)

      productMap.set(name, current)
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  const paidOrders = confirmed.filter((o: any) =>
    ["approved", "paid", "paid_cash"].includes(String(o.payment_status || ""))
  )

  const paymentPending = confirmed.filter((o: any) =>
    ["pending", "pending_cash"].includes(String(o.payment_status || ""))
  )

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <Metric title="Ventas" value={money(totalSales)} />
        <Metric title="Pedidos" value={confirmed.length} />
        <Metric title="Ticket" value={money(averageTicket)} />
        <Metric title="Clientes" value={customers.length} />
        <Metric title="Recompradores" value={repeatCustomers.length} />
        <Metric title="% recompra" value={`${customers.length ? Math.round((repeatCustomers.length / customers.length) * 100) : 0}%`} />
        <Metric title="Pagos pendientes" value={paymentPending.length} />
        <Metric title="Cancelados" value={cancelled.length} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="Ventas por canal">
          <List rows={Object.values(salesBySource).map((item: any) => ({
            left: item.source,
            sub: `${item.count} pedidos`,
            right: money(item.total)
          }))} />
        </Panel>

        <Panel title="Ventas por proveniencia">
  <List rows={Object.values(salesByAttribution).map((item: any) => ({
    left: item.label,
    sub: `${item.count} pedidos · descuento ${money(item.discount)}`,
    right: money(item.total)
  }))} />
</Panel>
        
        <Panel title="Pagos">
          <List rows={Object.values(salesByPayment).map((item: any) => ({
            left: item.method,
            sub: `${item.count} pedidos`,
            right: money(item.total)
          }))} />

          <div className="mt-4 rounded-2xl bg-[#f5f5f3] p-4">
            <div className="flex justify-between">
              <span>Pagados</span>
              <strong>{paidOrders.length}</strong>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Pendientes de cobro</span>
              <strong>{paymentPending.length}</strong>
            </div>
          </div>
        </Panel>

        <Panel title="Top productos">
          <List rows={topProducts.map((p: any) => ({
            left: p.name,
            sub: `${p.quantity} unidades`,
            right: money(p.total)
          }))} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Mejores clientes">
          <List rows={customers.slice(0, 10).map((c: any) => ({
            left: c.name || c.email || c.phone,
            sub: `${c.orders} compras · última ${formatDate(c.lastOrderAt)}`,
            right: money(c.total)
          }))} />
        </Panel>

        <Panel title="Últimos pedidos">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Canal</th>
                  <th className="py-2 pr-4">Pago</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.slice(0, 10).map((order: any) => (
                  <tr key={order.id} className="border-b border-[#eee]">
                    <td className="py-3 pr-4">{formatDate(order.created_at)}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{order.customer_name || "-"}</div>
                      <div className="text-xs text-gray-500">{order.customer_phone || order.customer_email || "-"}</div>
                    </td>
                    <td className="py-3 pr-4">{order.source || "-"}</td>
                    <td className="py-3 pr-4">
                      {order.payment_method || "-"} · {order.payment_status || "-"}
                    </td>
                    <td className="py-3 pr-4 text-right font-bold">{money(order.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Coming title="Gastos" text="Acá vamos a importar logística, proveedores, Meta Ads, ChatGPT, GHL y otros gastos." href="/superadmin/expenses" />
        <Coming title="Proveedores" text="Base de proveedores, contacto, dirección, productos y ubicación." href="/superadmin/suppliers" />
        <Coming title="Mapa" text="Clientes y proveedores geolocalizados para rutas y cuadrículas." href="/superadmin/map" />
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

function Panel({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[#e3e1dc] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-serif font-bold">{title}</h2>
      {children}
    </div>
  )
}

function List({
  rows
}: {
  rows: Array<{ left: string; sub?: string; right?: string }>
}) {
  if (!rows.length) {
    return <p className="text-sm text-gray-500">Sin datos todavía.</p>
  }

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div
          key={`${row.left}-${index}`}
          className="flex items-center justify-between gap-4 rounded-2xl bg-[#f5f5f3] p-3"
        >
          <div>
            <p className="font-semibold">{row.left}</p>
            {row.sub && <p className="text-xs text-gray-500">{row.sub}</p>}
          </div>

          {row.right && <p className="font-bold">{row.right}</p>}
        </div>
      ))}
    </div>
  )
}

function Coming({
  title,
  text,
  href
}: {
  title: string
  text: string
  href: string
}) {
  return (
    <a
      href={href}
      className="rounded-3xl border border-dashed border-[#bbb4a7] bg-white p-6 shadow-sm hover:border-[#1f2a1f]"
    >
      <h3 className="text-xl font-serif font-bold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
      <p className="mt-4 text-sm font-semibold">Abrir módulo →</p>
    </a>
  )
}
