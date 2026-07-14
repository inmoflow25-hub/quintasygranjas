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

function formatItems(items: any[] | null | undefined) {
  if (!items || items.length === 0) return "-"

  return items
    .map((item) => `${item.product_name} x${item.quantity}`)
    .join(" · ")
}

export default async function SuperAdminOrdersPage() {
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
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-red-600">Error cargando pedidos: {error.message}</p>
      </div>
    )
  }

  const safeOrders = orders || []
  const confirmedOrders = safeOrders.filter((order: any) => order.status === "confirmed")

  const customerCounts = new Map<string, number>()

  for (const order of confirmedOrders as any[]) {
    const key = customerKey(order)
    if (!key) continue

    customerCounts.set(key, (customerCounts.get(key) || 0) + 1)
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric
  title="Pedidos reales"
  value={safeOrders.filter((o: any) => o.source !== "csv_import_real").length}
/>
        <Metric title="Confirmados" value={confirmedOrders.length} />
        <Metric
          title="Cancelados"
          value={safeOrders.filter((o: any) => o.status === "cancelled").length}
        />
        <Metric
          title="Pago pendiente"
          value={
            confirmedOrders.filter((o: any) =>
              ["pending", "pending_cash"].includes(String(o.payment_status || ""))
            ).length
          }
        />
        <Metric
          title="Facturación"
          value={money(
            confirmedOrders.reduce(
              (acc: number, o: any) => acc + Number(o.price || 0),
              0
            )
          )}
        />
      </section>

      <section className="rounded-3xl border border-[#e3e1dc] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold">Pedidos</h2>
            <p className="text-sm text-gray-500">
              Pedido confirmado = comprado. Pago pendiente se ve en payment_status.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#efefed] text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Compras</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {safeOrders.filter((order: any) => order.source !== "csv_import_real").map((order: any) => {
                const key = customerKey(order)
                const purchases = customerCounts.get(key) || 0
                const isRepeat = purchases >= 2

                return (
                  <tr key={order.id} className="border-b border-[#eee] align-top">
                    <td className="px-4 py-4 whitespace-nowrap">
                      {formatDateTime(order.created_at)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium">{order.customer_name || "-"}</div>
                      {isRepeat && (
                        <div className="mt-1 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
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
  <div className="font-medium">
    {order.app_context === "pwa" ? "App" : "Web"}
  </div>

  <div className="text-xs text-gray-500">
    {order.source || "-"}
  </div>

  {order.affiliate_slug && (
    <div className="mt-2 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
      {order.attribution_label || order.affiliate_slug}
    </div>
  )}

  {Number(order.affiliate_discount_percent || 0) > 0 && (
    <div className="mt-1 text-xs font-semibold text-green-700">
      {Number(order.affiliate_discount_percent || 0)}% off ·{" "}
      {money(order.affiliate_discount_amount)}
    </div>
  )}
</td>

                    <td className="px-4 py-4">
                      <div>{order.payment_method || "-"}</div>
                      <div className="text-xs text-gray-500">
                        {order.payment_status || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium">{order.status || "-"}</td>

                    <td className="px-4 py-4">
                      {purchases || "-"}
                    </td>

                    <td className="px-4 py-4 text-right font-bold">
                      {money(order.price)}
                    </td>
                  </tr>
                )
              })}
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
