"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPage() {

  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

useEffect(() => {

  async function loadData() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/")
      return
    }

    const ADMIN_IDS = [
      "95aae067-c075-4a04-95b2-8e4aa5cfb25f",
      "92b5059a-69b1-4cbb-ac1f-a5f6c17a87d6"
    ]

    if (!ADMIN_IDS.includes(user.id)) {
      router.push("/")
      return
    }

    const { data, error } = await supabase.rpc("get_admin_orders")

    if (error) {
      console.error("ADMIN ERROR:", error)
      setLoading(false)
      return
    }

    setOrders(data || [])
    setLoading(false)
  }

  loadData()

  const channel = supabase
    .channel("orders-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders"
      },
      () => {
        loadData()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }

}, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Cargando pedidos...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">

      <h1 className="text-3xl font-bold mb-8">
        📦 Pedidos / Entregas
      </h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Caja / Productos</th>
              <th className="p-3">Pago</th>
              <th className="p-3">Dirección</th>
              <th className="p-3">Zona</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Día</th>
              <th className="p-3">Entrega</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>

          <tbody>

            {orders.map((o:any) => (
              <tr key={o.order_id} className="border-b">

                <td className="p-3">
                  {new Date(o.fecha_compra).toLocaleDateString()}
                </td>

                <td className="p-3 font-medium">
                  {o.nombre || "-"}
                </td>

                <td className="p-3">
                  {o.email}
                </td>

                <td className="p-3 font-medium">
                  {o.productos || o.caja || "-"}
                </td>

                <td className="p-3">
                  {o.payment_method || "-"}
                </td>

                <td className="p-3">
                  {o.direccion || "-"}
                </td>

                <td className="p-3">
                  {o.zona || "-"}
                </td>

                <td className="p-3">
                  {o.telefono || "-"}
                </td>

                <td className="p-3">
                  {o.dia_entrega || "-"}
                </td>

                <td className="p-3">
                  {o.delivery_date
                    ? new Date(o.delivery_date).toLocaleDateString()
                    : "Sin asignar"}
                </td>

                <td className="p-3">
                  {o.estado || "-"}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </main>
  )
}

