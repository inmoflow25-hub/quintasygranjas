export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatDate(dateString: string | null) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  })
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

function formatPayment(method: string | null, status: string | null, price: number | null) {
  const methodLabel =
    method === "mercadopago"
      ? "MP"
      : method === "cash"
        ? "Efectivo"
        : method || "-"

  const statusLabel = status || "-"

  return `${methodLabel} · ${statusLabel} · $${Number(price || 0).toLocaleString("es-AR")}`
}

function formatItems(items: any[] | null | undefined) {
  if (!items || items.length === 0) return "-"

  return items
    .map((item) => `${item.product_name} x${item.quantity}`)
    .join(" · ")
}

export default async function AdminPage() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      source,
      box_id,
      price,
      payment_method,
      payment_status,
      status,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      delivery_city,
      delivery_notes,
      order_items (
        id,
        product_name,
        quantity,
        price
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] p-10">
        <h1 className="mb-6 text-5xl font-serif font-bold text-[#1f2a1f]">
          📦 Pedidos / Entregas
        </h1>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-red-600">Error cargando admin: {error.message}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] p-10">
      <h1 className="mb-8 text-5xl font-serif font-bold text-[#1f2a1f]">
        📦 Pedidos / Entregas
      </h1>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-[#efefed] text-[#2b2b2b]">
            <tr>
              <th className="px-4 py-4 text-xl font-serif">Fecha</th>
              <th className="px-4 py-4 text-xl font-serif">Nombre</th>
              <th className="px-4 py-4 text-xl font-serif">Email</th>
              <th className="px-4 py-4 text-xl font-serif">Caja / Productos</th>
              <th className="px-4 py-4 text-xl font-serif">Pago</th>
              <th className="px-4 py-4 text-xl font-serif">Dirección</th>
              <th className="px-4 py-4 text-xl font-serif">Zona</th>
              <th className="px-4 py-4 text-xl font-serif">Teléfono</th>
              <th className="px-4 py-4 text-xl font-serif">Día</th>
              <th className="px-4 py-4 text-xl font-serif">Entrega</th>
              <th className="px-4 py-4 text-xl font-serif">Estado</th>
            </tr>
          </thead>

          <tbody>
            {!orders || orders.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-gray-500">
                  No hay pedidos todavía.
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr key={order.id} className="border-t border-[#ecece8] align-top">
                  <td className="px-4 py-4 text-sm text-[#2b2b2b]">
                    {formatDateTime(order.created_at)}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#2b2b2b]">
                    {order.customer_name || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#2b2b2b]">
                    {order.customer_email || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#2b2b2b] max-w-[320px]">
                    <div className="font-medium">
                      {order.source === "box" ? "Box" : order.source === "cart" ? "Cart" : "-"}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatItems(order.order_items)}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-[#2b2b2b]">
                    {formatPayment(order.payment_method, order.payment_status, order.price)}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#2b2b2b] max-w-[260px]">
                    {order.delivery_address || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#2b2b2b]">
                    {order.delivery_city || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#2b2b2b]">
                    {order.customer_phone || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#2b2b2b]">
                    {formatDate(order.created_at)}
                  </td>

                  <td className="px-4 py-4 text-sm text-[#2b2b2b] max-w-[220px]">
                    {order.delivery_notes || "-"}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-[#2b2b2b]">
                    {order.status || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
